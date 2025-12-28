# Event-Driven Booking System

This repository is a learning and demonstration project focused on building reliable , event-driven backend systems using sagas, messaging and observability.

Work in progress.

The system converges to a correct booking state even when payment and booking events arrive out of order or are duplicated.

NOTE: Time-based refunds are handled via reconciliation jobs in production.This service models event-driven correctness only.
