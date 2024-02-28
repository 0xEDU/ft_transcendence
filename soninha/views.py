"""Views for the soninha app."""

# Python Std Libs
from http import HTTPStatus
import json
import os
import requests
import uuid

# Our imports
from soninha.models import User

# Django's imports
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, get_object_or_404
from django.views import View
from django.views.generic import TemplateView


class UserTemplateView(TemplateView):
    """Returns the user template."""
    template_name = "soninha/profile-section.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        session = self.request.session
        if "user_id" in session and session["user_id"] != "":
            user = User.objects.get(pk=session["user_id"])
            context["h1_margin"] = "mb-4"
            context["h1_text"] = "Logged as " + user.login_intra
            context["user_image"] = user.intra_cdn_profile_picture_url
            context["anchor_function"] = 'id=logoutButton'
            context["anchor_text"] = "Logout"
            return context
        context["h1_margin"] = "mb-0"
        context["h1_text"] = "You are not logged"
        context["anchor_function"] = f"href={os.getenv('INTRA_ACCESS_URL')}"
        context["anchor_text"] = "Login with intra"
        return context


class LoginView(View):
    """Returns the login view. Might be removed."""

    def _get_token(self, code):
        """Returns the intra token."""

        intra_endpoint = os.getenv('INTRA_ENDPOINT')
        uid = os.getenv('INTRA_UID')
        secret = os.getenv('INTRA_SECRET')
        redirect_uri = os.getenv('TRANSCENDENCE_IP')
        url_parameters = "?grant_type=authorization_code&client_id=" + \
            uid + "&client_secret=" + secret + "&code=" + code + \
            "&redirect_uri=http%3A%2F%2F" + redirect_uri + "%3A8000%2Fauth%2Flogin%2F"
        tokenJson = json.loads(requests.post(
            intra_endpoint + '/oauth/token' + url_parameters).content)
        if "access_token" in tokenJson.keys():
            return tokenJson["access_token"]
        return ""

    def get(self,  request, *args, **kwargs):
        """Get method."""

        code = request.GET.get('code', '')
        token = self._get_token(code)
        if not token:
            return HttpResponse("Couldn't get intra token", status=500)
        bearer = "Bearer " + token
        cadet_api = os.getenv('INTRA_ENDPOINT') + os.getenv('CADET_API')
        response = json.loads(requests.get(cadet_api, headers={
            'Authorization': bearer}, timeout=5).content)
        login_intra = response["login"]
        pfp_intra = response["image"]["versions"]["medium"]
        if not pfp_intra:
            pfp_intra = "/static/images/default_user_image.svg"
        new_user, _ = User.objects.get_or_create(
            display_name=login_intra, login_intra=login_intra, intra_cdn_profile_picture_url=pfp_intra)
        request.session["user_id"] = new_user.id
        return redirect('/')  # This will return the html


class LogoutView(View):
    """Logout view."""

    def get(self, request, *args, **kwargs):
        """Get method."""
        request.session["user_id"] = ""
        return HttpResponse('')


def update_profile_picture(request):
    if request.method == 'POST':
        uploaded_file = request.FILES['profilePicture']
        user = get_object_or_404(User, pk=request.session["user_id"])

        # Delete the old profile picture file if it exists
        if user.profile_picture and os.path.exists(str(user.profile_picture)):
            os.remove(str(user.profile_picture))

        # Generate a unique filename for the uploaded file
        filename = f"{uuid.uuid4().hex}{os.path.splitext(uploaded_file.name)[1]}"

        # Define the directory where you want to save the uploaded files
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'profile_pictures')
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
        
        # Construct the file path with the unique filename
        file_path = os.path.join(upload_dir, filename)

        # Save the file to the filesystem
        with open(file_path, 'wb') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)

        # Update the user's profile picture attribute with the file path
        user.profile_picture = file_path
        user.save()

        return JsonResponse({"status": "OK", "file_path": user.profile_picture.url})
    return JsonResponse({"status": HTTPStatus.METHOD_NOT_ALLOWED})

