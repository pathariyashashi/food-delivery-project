import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from orders.models import Order


class OrderTrackingConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        # =====================================
        # ORDER ID
        # =====================================

        self.order_id = self.scope["url_route"]["kwargs"]["order_id"]

        self.room_group_name = f"order_{self.order_id}"


        # =====================================
        # USER
        # =====================================

        user = self.scope.get("user")

        if not user or user.is_anonymous:

            await self.close(code=4001)

            return


        # =====================================
        # ACCESS CHECK
        # =====================================

        has_access = await self.check_order_access(
            user.id,
            self.order_id
        )

        if not has_access:

            await self.close(code=4003)

            return


        # =====================================
        # JOIN ORDER GROUP
        # =====================================

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )


        # =====================================
        # ACCEPT
        # =====================================

        await self.accept()


        # =====================================
        # CONNECTION MESSAGE
        # =====================================

        await self.send(
            text_data=json.dumps(
                {
                    "type": "connection",
                    "message": "Live tracking connected",
                    "order_id": self.order_id,
                }
            )
        )


    # =========================================
    # DISCONNECT
    # =========================================

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )


    # =========================================
    # ORDER ACCESS
    # =========================================

    @database_sync_to_async
    def check_order_access(
        self,
        user_id,
        order_id
    ):

        return Order.objects.filter(
            id=order_id
        ).filter(
            user_id=user_id
        ).exists() or Order.objects.filter(
            id=order_id,
            delivery_rider__user_id=user_id
        ).exists()


    # =========================================
    # LOCATION UPDATE
    # =========================================

    async def location_update(self, event):

        await self.send(
            text_data=json.dumps(
                {
                    "type": "location_update",

                    "order_id":
                        event["order_id"],

                    "latitude":
                        event["latitude"],

                    "longitude":
                        event["longitude"],
                }
            )
        )