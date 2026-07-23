#!/usr/bin/env python3
import socket
import json

# Create a socket connection
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(10)

try:
    sock.connect(('127.0.0.1', 8000))
    print("Connected to backend")
    
    # Send a simple GET request for /health
    request = b"GET /health HTTP/1.1\r\nHost: localhost\r\n\r\n"
    sock.sendall(request)
    
    # Receive response
    response = b""
    while True:
        data = sock.recv(4096)
        if not data:
            break
        response += data
        if b"\r\n\r\n" in response:
            # Check if we have the full response
            parts = response.split(b"\r\n\r\n", 1)
            if len(parts) > 1 and not parts[1]:
                break
    
    print(f"Raw response length: {len(response)}")
    print(f"Response: {response[:500].decode('utf-8', errors='replace')}")
    
    sock.close()
    
except Exception as e:
    print(f"Error: {type(e).__name__}: {str(e)}")
finally:
    sock.close()
