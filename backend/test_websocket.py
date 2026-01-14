#!/usr/bin/env python3
"""
Test WebSocket connection to chat endpoint
Usage: python3 test_websocket.py
"""

import asyncio
import websockets
import json

async def test_websocket():
    # Replace with your actual JWT token
    token = "your_jwt_token_here"
    uri = f"ws://127.0.0.1:8000/ws/chat?token={token}"
    
    print(f"Connecting to: {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✓ Connected successfully!")
            
            # Wait for initial conversation list
            response = await websocket.recv()
            print(f"✓ Received: {response[:100]}...")
            
            # Send a test message (optional)
            # test_message = {
            #     "action": "send_message",
            #     "conversation_id": 1,
            #     "message": "Test message"
            # }
            # await websocket.send(json.dumps(test_message))
            # print("✓ Message sent")
            
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"✗ Connection failed with status code: {e.status_code}")
        print(f"  This usually means: {get_status_meaning(e.status_code)}")
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")

def get_status_meaning(status_code):
    meanings = {
        404: "Route not found - check your URL path and routing configuration",
        403: "Forbidden - check authentication/authorization",
        401: "Unauthorized - check your JWT token",
        500: "Internal server error - check server logs",
    }
    return meanings.get(status_code, "Unknown error")

if __name__ == "__main__":
    print("WebSocket Connection Test")
    print("=" * 50)
    asyncio.run(test_websocket())
