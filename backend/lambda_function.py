"""
Cloud Resume Challenge — visitor counter Lambda.

Atomically increments a single counter item in DynamoDB and returns the
new total. Designed to sit behind an API Gateway HTTP API GET route.

Environment variables:
  TABLE_NAME  - DynamoDB table name
  ALLOWED_ORIGIN - value for Access-Control-Allow-Origin
"""

import json
import os

import boto3

TABLE_NAME = os.environ.get("TABLE_NAME", "cloud-resume-visitor-count")
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
ITEM_ID = "visitor_count"

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Vary": "Origin",
}


def handler(event, context):
    safe_event = event if isinstance(event, dict) else {}
    request_context = safe_event.get("requestContext", {})
    http_context = request_context.get("http", {})
    method = http_context.get("method") or safe_event.get("httpMethod")

    if method == "OPTIONS":
        return {"statusCode": 204, "headers": CORS_HEADERS, "body": ""}

    try:
        response = table.update_item(
            Key={"id": ITEM_ID},
            UpdateExpression="ADD #c :inc",
            ExpressionAttributeNames={"#c": "count"},
            ExpressionAttributeValues={":inc": 1},
            ReturnValues="UPDATED_NEW",
        )
        count = int(response["Attributes"]["count"])
        return {
            "statusCode": 200,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({"count": count}),
        }
    except Exception as exc:  # noqa: BLE001 - want a clean 500 for any failure
        print(f"Error updating visitor count: {exc}")
        return {
            "statusCode": 500,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({"error": "Could not update visitor count"}),
        }
