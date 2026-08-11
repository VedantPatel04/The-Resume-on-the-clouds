"""Unit tests for the visitor counter Lambda without live AWS calls."""

import importlib
import json
import sys
import types
import unittest


class FakeTable:
    def __init__(self):
        self.calls = 0
        self.error = None

    def update_item(self, **kwargs):
        self.calls += 1
        if self.error:
            raise self.error
        return {"Attributes": {"count": self.calls}}


fake_table = FakeTable()
fake_boto3 = types.ModuleType("boto3")
fake_boto3.resource = lambda service: types.SimpleNamespace(
    Table=lambda table_name: fake_table
)
sys.modules.setdefault("boto3", fake_boto3)

lambda_function = importlib.import_module("lambda_function")


class HandlerTests(unittest.TestCase):
    def setUp(self):
        fake_table.calls = 0
        fake_table.error = None
        lambda_function.table = fake_table

    def test_get_increments_and_returns_count(self):
        result = lambda_function.handler(
            {"requestContext": {"http": {"method": "GET"}}}, None
        )

        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(json.loads(result["body"]), {"count": 1})
        self.assertEqual(result["headers"]["Cache-Control"], "no-store")

    def test_options_does_not_increment(self):
        result = lambda_function.handler({"httpMethod": "OPTIONS"}, None)

        self.assertEqual(result["statusCode"], 204)
        self.assertEqual(result["body"], "")
        self.assertEqual(fake_table.calls, 0)

    def test_dynamodb_error_returns_safe_response(self):
        fake_table.error = RuntimeError("DynamoDB unavailable")

        result = lambda_function.handler({}, None)

        self.assertEqual(result["statusCode"], 500)
        self.assertEqual(
            json.loads(result["body"]),
            {"error": "Could not update visitor count"},
        )


if __name__ == "__main__":
    unittest.main()
