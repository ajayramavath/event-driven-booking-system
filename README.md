# Event-Driven Booking System

Backstory --
  While working on a home services startup, I encountered production issues where payments were successfully completed but bookings were not created due to API failures or service crashes. This led to poor user experience and bad app store reviews.

  This project was built to explore a robust solution using sagas, event-driven design, and automatic compensation (refunds) to guarantee correctness under failure.

  NOTE: Time-based refunds are handled via reconciliation jobs in production.This service models event-driven correctness only.

The system converges to a correct booking state even when payment and booking events arrive out of order or are duplicated.

