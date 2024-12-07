from rest_framework.views import APIView    # type: ignore
from rest_framework.response import Response   # type: ignore
from myapp.models import Reservations
from myapp.serializers.reservation_serializers import ReservationSerializer
from rest_framework.permissions import AllowAny # type: ignore

class ReservationListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        reservations = Reservations.objects.all()
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)
