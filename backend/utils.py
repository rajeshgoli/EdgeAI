import pandas as pd
import random
import os

# Hardcoded path for the hackathon
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "es-4h.csv")

def load_csv(file_path: str = DATA_PATH) -> pd.DataFrame:
    """
    Loads the CSV data.
    Assumes columns: Date;Time;Open;High;Low;Close;Volume
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Data file not found at {file_path}")
    
    # Read CSV with semicolon separator and no header
    df = pd.read_csv(file_path, sep=';', header=None, names=['date', 'time', 'open', 'high', 'low', 'close', 'volume'])
    
    # Create a 'time' column for Lightweight Charts (timestamp or string)
    # We can combine date and time, or just use them as is.
    # Lightweight charts likes 'yyyy-mm-dd' or unix timestamp.
    # Let's combine them to be safe: "01/04/2007 17:05:00"
    
    # Parse datetime
    # Format appears to be DD/MM/YYYY
    df['datetime'] = pd.to_datetime(df['date'] + ' ' + df['time'], format='%d/%m/%Y %H:%M:%S')
    
    # Convert to unix timestamp for Lightweight Charts (seconds)
    df['time'] = df['datetime'].astype('int64') // 10**9
    
    # Drop duplicates based on time
    df = df.drop_duplicates(subset=['time'])
    
    # Sort by time
    df = df.sort_values(by='time')
    
    return df

def get_random_slice(df: pd.DataFrame, past: int = 100, future: int = 20):
    """
    Returns a random slice of the dataframe.
    Returns:
        past_df: DataFrame (the visible history)
        future_df: DataFrame (the hidden future)
    """
    total_needed = past + future
    if len(df) < total_needed:
        raise ValueError("Dataframe is too small for the requested slice.")
    
    # Pick a random start index
    # We need to ensure we have enough data for the slice
    max_start_index = len(df) - total_needed
    start_index = random.randint(0, max_start_index)
    
    slice_df = df.iloc[start_index : start_index + total_needed].copy()
    
    # Reset index for clean JSON serialization if needed, or just return list of dicts
    # Lightweight charts expects: { time, open, high, low, close }
    
    # Convert to list of dicts for easy API response
    records = slice_df.to_dict(orient='records')
    
    past_data = records[:past]
    future_data = records[past:]
    
    return past_data, future_data

def get_latest_slice(df: pd.DataFrame, n: int = 1000):
    """
    Returns the last n bars of the dataframe.
    Returns:
        past_data: List[dict] (the visible history)
        future_data: List[dict] (empty list, as this is the latest data)
    """
    if len(df) < n:
        # If we don't have enough data, just return what we have
        slice_df = df.copy()
    else:
        slice_df = df.iloc[-n:].copy()
    
    # Convert to list of dicts for easy API response
    records = slice_df.to_dict(orient='records')
    
    # For "latest" mode, we might want to show everything as "past" 
    # and have no "future" hidden data, or maybe split it?
    # The user asked for "1000 bars, that represents real 4-5 months of data in the past. Show that."
    # Usually in a backtest/replay app, "past" is what's on chart, "future" is what's coming.
    # If they just want to "load real data... Show that", implies they want to see it on the chart.
    # So we'll put it all in 'past_data'.
    
    past_data = records
    future_data = []
    
    return past_data, future_data
