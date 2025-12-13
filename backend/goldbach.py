def calculate_goldbach_levels(price_data):
    """
    Calculates Goldbach levels (0.11, 0.5, 0.89) based on the visible range.
    
    Args:
        price_data (list of dict): List of candle data (open, high, low, close).
        
    Returns:
        list of dict: Levels with value and label.
    """
    if not price_data:
        return []
        
    # Find min low and max high in the visible range
    min_price = min(p['low'] for p in price_data)
    max_price = max(p['high'] for p in price_data)
    price_range = max_price - min_price
    
    if price_range == 0:
        return []

    levels = [
        {"value": min_price + (price_range * 0.11), "label": "0.11 (Support)", "color": "#ef4444"}, # Red
        {"value": min_price + (price_range * 0.50), "label": "0.50 (Equilibrium)", "color": "#eab308"}, # Yellow
        {"value": min_price + (price_range * 0.89), "label": "0.89 (Resistance)", "color": "#22c55e"}, # Green
    ]
    
    return levels
