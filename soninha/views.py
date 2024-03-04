"""Views for the soninha app."""

# Python Std Libs
from http import HTTPStatus
import json
import os
import requests
import uuid

# Our imports
from soninha.models import User, Achievements
from stats.models import UserStats

# Django's imports
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View


class LoginView(View):
    """
    This view is invoked by the intra API after the user has been authenticated.
    It should receive a code from the intra API.
    This code must then be exchanged by a valid access token, which represents the user's authorization for our application to retrieve their information in the intra API.
    """

    def _get_token(self, code):
        """Returns the intra token."""

        intra_endpoint = os.getenv('INTRA_ENDPOINT')
        uid = os.getenv('INTRA_UID')
        secret = os.getenv('INTRA_SECRET')
        redirect_uri = os.getenv('TRANSCENDENCE_IP')
        protocol = os.getenv('TRANSCENDENCE_PROTOCOL')

        url_parameters = "?grant_type=authorization_code&client_id=" + \
            uid + "&client_secret=" + secret + "&code=" + code + \
            "&redirect_uri=" + protocol + "%3A%2F%2F" + redirect_uri + "%3A8000%2Fauth%2Flogin%2F"
        tokenJson = json.loads(requests.post(
            intra_endpoint + '/oauth/token' + url_parameters).content)
        if "access_token" in tokenJson.keys():
            return tokenJson["access_token"]
        return ""

    def get(self,  request, *args, **kwargs):
        """Get method."""

        # Exchange code by authorization token
        # (The user grants permission for our application to retrieve their information)
        code = request.GET.get('code', '')
        token = self._get_token(code)

        if not token:
            return HttpResponse("Couldn't get intra token", status=500)

        # Make new call to intra's API to retrieve user's information
        bearer = "Bearer " + token
        cadet_api = os.getenv('INTRA_ENDPOINT') + os.getenv('CADET_API')
        response = requests.get(
            cadet_api, headers={
                'Authorization': bearer
            }, timeout=5
        )

        # Get user information from response
        parsedResponse = json.loads(response.content)
        login_intra = parsedResponse["login"]
        pfp_intra = parsedResponse["image"]["versions"]["medium"]
        if not pfp_intra:
            pfp_intra = "/static/images/default_user_image.svg"

        # Create new user entry in our database, or just retrieves it if they've logged in before
        user, is_new_entry = User.objects.get_or_create(login_intra=login_intra)
        if (is_new_entry):
            user.display_name = login_intra
            user.intra_cdn_profile_picture_url = pfp_intra
            user.save()
        # Create new achievement entry for user in our database
        achievements, is_new_entry = Achievements.objects.get_or_create(user=user)
        # Create new stats entry for user in our database
        user_stats, is_new_entry = UserStats.objects.get_or_create(user=user)

        # Register user as logged in in session
        request.session["user_id"] = user.id

        return redirect('/')  # This will return the html


class LogoutView(View):
    """Logout view."""

    def get(self, request, *args, **kwargs):
        """Get method."""
        request.session["user_id"] = ""
        return HttpResponse('')


class ProfilePictureView(View):
    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('profilePicture')
        if not uploaded_file:
            return render(request=request, template_name='components/errors/empty_profile_picture_form.html', status=HTTPStatus.BAD_REQUEST)

        user = get_object_or_404(User, pk=request.session.get("user_id"))

        # Delete the old profile picture file if it exists
        if user.profile_picture:
            old_file_path = os.path.join(settings.MEDIA_ROOT, str(user.profile_picture))
            if os.path.exists(old_file_path):
                os.remove(old_file_path)

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
        user.profile_picture = os.path.relpath(file_path, settings.MEDIA_ROOT)
        user.save()

        return JsonResponse({"new_pfp_url": user.profile_picture.url}, status=HTTPStatus.OK)

class DisplayNameView(View):
    def post(self, request, *args, **kwargs):
        new_display_name = request.POST.get("display-name")

        if not new_display_name:
            return render(request=request, template_name='components/errors/empty_display_name_form.html', status=HTTPStatus.BAD_REQUEST)

        user = get_object_or_404(User, pk=request.session.get("user_id"))

        # Update the user's profile picture attribute with the file path
        user.display_name = new_display_name
        user.save()

        return JsonResponse({"new_display_name": user.display_name}, status=HTTPStatus.OK)
