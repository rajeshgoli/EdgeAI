import math

def get_dynamic_po3(price_data):
    """
    Determines the best PO3 number based on the visible price range.
    """
    if not price_data:
        return 243 # Default
        
    min_low = min(p['low'] for p in price_data)
    max_high = max(p['high'] for p in price_data)
    visible_range = max_high - min_low
    
    # PO3 candidates (Powers of 3)
    po3s = [9, 27, 81, 243, 729, 2187, 6561]
    
    # Find nearest PO3 to the visible range
    best_po3 = min(po3s, key=lambda x: abs(x - visible_range))
    
    return best_po3

def calculate_dealing_range(current_price, po3_number):
    """
    Calculates the Dealing Range based on the PO3 number.
    Formula: Range_Low = Floor(Current_Price / PO3_Number) * PO3_Number
    """
    range_low = math.floor(current_price / po3_number) * po3_number
    range_high = range_low + po3_number
    return range_low, range_high

def get_goldbach_levels(range_low, range_high):
    """
    Generates the list of price levels for all Goldbach ratios.
    """
    ratios = {
        0.00: "Range Low (Hard Boundary)",
        0.03: "Rejection Block (RB)",
        0.11: "Order Block (OB)",
        0.17: "Fair Value Gap (FVG)",
        0.29: "Liquidity Void (LV)",
        0.41: "Breaker (BR)",
        0.50: "Equilibrium (EQ)",
        0.59: "Breaker (BR)",
        0.71: "Liquidity Void (LV)",
        0.83: "Fair Value Gap (FVG)",
        0.89: "Order Block (OB)",
        0.97: "Rejection Block (RB)",
        1.00: "Range High (Hard Boundary)"
    }
    
    price_range = range_high - range_low
    levels = []
    
    for ratio, label in ratios.items():
        price = range_low + (price_range * ratio)
        
        # Color coding based on role
        color = "white"
        if "Order Block" in label:
            color = "#ef4444" if ratio < 0.5 else "#22c55e" # Red for support? Wait, OBs can be both. Let's stick to user prompt colors if any.
            # Prompt example: OB (0.11) is red.
            if ratio == 0.11: color = "red"
            if ratio == 0.89: color = "green" # Assumption
        elif "Equilibrium" in label:
            color = "yellow"
        elif "Range" in label:
            color = "white"
        else:
            color = "gray"

        levels.append({
            "price": round(price, 2),
            "label": f"{label} ({ratio})",
            "ratio": ratio,
            "color": color
        })
        
    return levels

def detect_patterns(price_data, levels):
    """
    Scans for HIPPO and PO3 Stop Runs.
    """
    signals = []
    
    if len(price_data) < 20:
        return signals

    # 1. HIPPO (Hidden Interbank Price Point Objective)
    # Definition: Consolidation flanked by two gaps (FVGs).
    # Simplified logic: Look for a candle (or 2) with a gap before and after.
    # We'll check the last 20 candles.
    
    # We need to iterate backwards or forwards. Let's look at the recent history.
    recent_data = price_data[-20:]
    
    hippo_detected = False
    for i in range(2, len(recent_data) - 2):
        # Bullish HIPPO (Island Bottom): Gap Down, Consolidation, Gap Up
        # Gap Down: High[i] < Low[i-1]
        # Gap Up: Low[i+1] > High[i]
        # Wait, gaps are usually between Close/Open or High/Low. 
        # FVG definition is usually 3 candles: Candle 1 High < Candle 3 Low (for bullish).
        # "Isolated by a gap above it AND a gap below it"
        
        # Let's try a simple "Island" detection
        curr = recent_data[i]
        prev = recent_data[i-1]
        next_c = recent_data[i+1]
        
        # Check for gaps
        # Gap Down before: prev['low'] > curr['high'] (strict gap)
        # Gap Up after: next_c['low'] > curr['high'] (strict gap)
        if (prev['low'] > curr['high']) and (next_c['low'] > curr['high']):
             signals.append({
                "type": "HIPPO",
                "detected": True,
                "details": f"Bullish HIPPO detected at index {i} (Price: {curr['close']})"
            })
             hippo_detected = True
             
        # Bearish HIPPO (Island Top)
        # Gap Up before: prev['high'] < curr['low']
        # Gap Down after: next_c['high'] < curr['low']
        if (prev['high'] < curr['low']) and (next_c['high'] < curr['low']):
             signals.append({
                "type": "HIPPO",
                "detected": True,
                "details": f"Bearish HIPPO detected at index {i} (Price: {curr['close']})"
            })
             hippo_detected = True

    if not hippo_detected:
        signals.append({
            "type": "HIPPO",
            "detected": False,
            "details": "No HIPPO pattern found in recent price action."
        })

    # 2. PO3 Stop Runs
    # Price pierces a key level by exactly 3, 9, or 27 points and reverses.
    # Check the most recent swing high/low.
    # For simplicity, let's check the last 5 candles for wicks crossing levels.
    
    po3_numbers = [3, 9, 27]
    tolerance = 1.0 # Tolerance for "exactly"
    
    last_candle = price_data[-1]
    
    for level in levels:
        lvl_price = level['price']
        
        # Check High Wick
        if last_candle['high'] > lvl_price and last_candle['close'] < lvl_price:
            wick_size = last_candle['high'] - lvl_price
            for p in po3_numbers:
                if abs(wick_size - p) <= tolerance:
                    signals.append({
                        "type": "PO3 Stop Run",
                        "detected": True,
                        "details": f"Recent high rejected {level['label']} with a ~{p}-point wick."
                    })
                    
        # Check Low Wick
        if last_candle['low'] < lvl_price and last_candle['close'] > lvl_price:
            wick_size = lvl_price - last_candle['low']
            for p in po3_numbers:
                if abs(wick_size - p) <= tolerance:
                    signals.append({
                        "type": "PO3 Stop Run",
                        "detected": True,
                        "details": f"Recent low rejected {level['label']} with a ~{p}-point wick."
                    })

    return signals

def calculate_goldbach_for_range(visible_high: float, visible_low: float, current_price: float) -> dict:
    """
    Calculate Goldbach levels based on visible chart range.
    Used for dynamic updates when user zooms.
    Shows up to 3 consecutive zones if price range spans multiple.
    """
    visible_range = visible_high - visible_low

    # PO3 candidates (Powers of 3)
    po3s = [3, 9, 27, 81, 243, 729, 2187, 6561]

    # Find nearest PO3 to the visible range
    # Use a PO3 that's roughly 1/3 to 1/2 of the visible range for better coverage
    best_po3 = min(po3s, key=lambda x: abs(x - visible_range / 2))

    # Calculate the primary dealing range (contains current price)
    primary_low, primary_high = calculate_dealing_range(current_price, best_po3)

    # Determine which zones are needed to cover the visible range
    # Start from the zone containing the lowest visible price
    start_zone_low = math.floor(visible_low / best_po3) * best_po3
    end_zone_low = math.floor(visible_high / best_po3) * best_po3

    # Calculate how many zones we need (cap at 3)
    num_zones = min(3, int((end_zone_low - start_zone_low) / best_po3) + 1)

    # Generate levels for all needed zones
    all_levels = []
    dealing_ranges = []

    for i in range(num_zones):
        zone_low = start_zone_low + (i * best_po3)
        zone_high = zone_low + best_po3

        # Only include zones that overlap with visible range
        if zone_high < visible_low or zone_low > visible_high:
            continue

        dealing_ranges.append({
            "low": zone_low,
            "high": zone_high
        })

        # Get levels for this zone with zone indicator in label
        zone_levels = get_goldbach_levels(zone_low, zone_high)

        # Add zone prefix to labels if multiple zones
        if num_zones > 1:
            for level in zone_levels:
                # Add zone range to distinguish levels from different zones
                level['label'] = f"[{int(zone_low)}-{int(zone_high)}] {level['label']}"

        all_levels.extend(zone_levels)

    # Remove duplicate price levels (keep first occurrence)
    seen_prices = set()
    unique_levels = []
    for level in all_levels:
        if level['price'] not in seen_prices:
            seen_prices.add(level['price'])
            unique_levels.append(level)

    return {
        "levels": unique_levels,
        "dealing_range": {
            "po3_size": best_po3,
            "low": primary_low,
            "high": primary_high,
            "all_ranges": dealing_ranges
        }
    }

def run_goldbach_analysis(price_data):
    """
    Main execution function for Goldbach Strategy.
    """
    if not price_data:
        return {}
        
    current_price = price_data[-1]['close']
    
    # Step 1: Define the Grid (Dynamic PO3)
    po3_size = get_dynamic_po3(price_data)
    range_low, range_high = calculate_dealing_range(current_price, po3_number=po3_size)
    levels = get_goldbach_levels(range_low, range_high)
    
    # Step 2: Locate Price
    zone = "Premium (>50%)" if current_price > (range_low + range_high)/2 else "Discount (<50%)"
    
    # Find nearest level
    nearest_level = min(levels, key=lambda x: abs(x['price'] - current_price))
    
    # Step 3: Detect Patterns
    signals = detect_patterns(price_data, levels)
    
    # Step 4: Determine Sentiment
    # Default based on Zone
    sentiment = "BULLISH" if zone.startswith("Discount") else "BEARISH"
    
    # Overrides based on patterns
    for s in signals:
        if not s['detected']: continue
        
        # Bullish Signals
        if "Bullish HIPPO" in s['details'] or "low rejected" in s['details']:
            sentiment = "BULLISH"
            
        # Bearish Signals
        if "Bearish HIPPO" in s['details'] or "high rejected" in s['details']:
            sentiment = "BEARISH"

    # Step 5: Generate Output
    narrative = f"Price is currently in the {zone}. Nearest level is {nearest_level['label']} at {nearest_level['price']}."
    if any(s['detected'] for s in signals if s['type'] == 'PO3 Stop Run'):
        narrative += " PO3 Stop Run detected, suggesting potential reversal."
    
    output = {
        "sentiment": sentiment,
        "dealing_range": {
            "po3_size": po3_size,
            "low": range_low,
            "high": range_high
        },
        "current_status": {
            "price": current_price,
            "zone": zone,
            "nearest_level": f"{nearest_level['label']} at {nearest_level['price']}"
        },
        "signals": signals,
        "narrative": narrative,
        "levels_to_draw": levels
    }
    
    return output
