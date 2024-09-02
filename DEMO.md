# Storing the initial version

## First version of an IRS:

```json
{
  "trade_id": "667",
  "book": "USD",
  "notional": "100k",
  "fixings": [
    {
      "fixing_date": "2023-01-02",
      "pay_date": "2023-01-04"
    },
    {
      "fixing_date": "2023-04-03",
      "pay_date": "2023-04-05"
    }
  ]
}
```
## Observing this version at 1.1 as it was created at time 1.0

```json
[
  {
    "event_time": 1,
    "ingestion_time": 1.1,
    "evt": {
      "trade_id": "667",
      "book": "USD",
      "notional": "100k",
      "fixings": [
        {
          "fixing_date": "2023-01-02",
          "pay_date": "2023-01-04"
        },
        {
          "fixing_date": "2023-04-03",
          "pay_date": "2023-04-05"
        }
      ]
    }
  }
]
```
# Changing the swap at time 4.1

The fixed swap looks like this

```json
{
  "trade_id": "667",
  "book": "USD",
  "notional": "500k",
  "fixings": [
    {
      "fixing_date": "2023-01-02",
      "pay_date": "2023-01-04"
    },
    {
      "fixing_date": "2023-04-03",
      "pay_date": "2023-04-05"
    }
  ]
}
```
## And the document looks like this now:
```json
[
  {
    "event_time": 1,
    "ingestion_time": 1.1,
    "evt": {
      "trade_id": "667",
      "book": "USD",
      "notional": "100k",
      "fixings": [
        {
          "fixing_date": "2023-01-02",
          "pay_date": "2023-01-04"
        },
        {
          "fixing_date": "2023-04-03",
          "pay_date": "2023-04-05"
        }
      ]
    }
  },
  {
    "event_time": 1,
    "ingestion_time": 4.1,
    "evt": {
      "trade_id": "667",
      "book": "USD",
      "notional": "500k",
      "fixings": [
        {
          "fixing_date": "2023-01-02",
          "pay_date": "2023-01-04"
        },
        {
          "fixing_date": "2023-04-03",
          "pay_date": "2023-04-05"
        }
      ]
    }
  }
]
```
# Now we retrieve the swap as per time 2.0
```json
{
  "event_time": 1,
  "ingestion_time": 1.1,
  "evt": {
    "trade_id": "667",
    "book": "USD",
    "notional": "100k",
    "fixings": [
      {
        "fixing_date": "2023-01-02",
        "pay_date": "2023-01-04"
      },
      {
        "fixing_date": "2023-04-03",
        "pay_date": "2023-04-05"
      }
    ]
  }
}
```
