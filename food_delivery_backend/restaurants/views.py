from rest_framework import generics,status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Restaurant
from .serializers import RestaurantSerializer
from rest_framework.response import Response
from django.db.models import Q
from .pagination import RestaurantPagination



# POST /api/restaurants/create/
class RestaurantCreateView(generics.CreateAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# GET /api/restaurants/
class RestaurantListView(generics.ListAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    pagination_class = RestaurantPagination

    def get_queryset(self):
        queryset = Restaurant.objects.all().order_by("-created_at")

        # Search
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(city__icontains=search) |
                Q(category__icontains=search)
            )

        # Filter by City
        city = self.request.query_params.get("city")
        if city:
            queryset = queryset.filter(city__iexact=city)

        # Filter by Category
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__iexact=category)

        # Filter by Open Status
        is_open = self.request.query_params.get("is_open")
        if is_open:
            queryset = queryset.filter(is_open=is_open.lower() == "true")

        return queryset


# GET /api/restaurants/1/
class RestaurantDetailView(generics.RetrieveAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    
    
#GET /api/restaurants/1/update/
class RestaurantUpdateView(generics.UpdateAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save()
    
# DELETE /api/restaurants/1/delete/
class RestaurantDeleteView(generics.DestroyAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()     # Restaurant fetch
        self.perform_destroy(instance)   # Delete

        return Response(
            {"message": "Restaurant deleted successfully"},
            status=status.HTTP_200_OK
        )