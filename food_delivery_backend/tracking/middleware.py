from urllib.parse import parse_qs

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async

from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import (
    InvalidToken,
    TokenError,
)

from accounts.models import User


class JWTAuthMiddleware(BaseMiddleware):

    async def __call__(
        self,
        scope,
        receive,
        send,
    ):

        # =====================================
        # GET TOKEN FROM QUERY STRING
        # =====================================

        query_string = scope.get(
            "query_string",
            b""
        ).decode()

        query_params = parse_qs(
            query_string
        )

        token = query_params.get(
            "token",
            [None]
        )[0]


        # =====================================
        # NO TOKEN
        # =====================================

        if not token:

            scope["user"] = None

            return await super().__call__(
                scope,
                receive,
                send
            )


        # =====================================
        # VALIDATE JWT
        # =====================================

        try:

            access_token = AccessToken(
                token
            )

            user_id = access_token.get(
                "user_id"
            )

            if not user_id:

                scope["user"] = None

                return await super().__call__(
                    scope,
                    receive,
                    send
                )


            # =================================
            # GET USER
            # =================================

            user = await self.get_user(
                user_id
            )

            scope["user"] = user


        except (
            InvalidToken,
            TokenError,
            Exception,
        ):

            scope["user"] = None


        # =====================================
        # CONTINUE
        # =====================================

        return await super().__call__(
            scope,
            receive,
            send
        )


    # =========================================
    # DATABASE USER
    # =========================================

    @database_sync_to_async
    def get_user(
        self,
        user_id
    ):

        try:

            return User.objects.get(
                id=user_id
            )

        except User.DoesNotExist:

            return None