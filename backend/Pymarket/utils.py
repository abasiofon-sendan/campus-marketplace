from django.contrib.auth import get_user_model
from django.http import HttpResponse

User = get_user_model()

def link_preview(request):
    vendor_id = request.GET.get('vendorId')
    
    try:
        vendor_info = User.objects.get(id=vendor_id)
    except User.DoesNotExist:
        return HttpResponse("Vendor not found", status=404)
    

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta property="og:title" content="{vendor_info.username}'s Profile - Upstart">
        <meta property="og:description" content="{vendor_info.bio}">
        <meta property="og:image" content="{vendor_info.profile_url}">
        <meta property="og:url" content="https://upstartpy.onrender.com/vendor-profile?vendorId={vendor_id}">
        <meta http-equiv="refresh" content="0;url=https://upstart-e9ry.onrender.com/vendor-profile.html?vendorId={vendor_id}">
    </head>
    <body>
        <p>Redirecting...</p>
    </body>
    </html>
    """
    
    return HttpResponse(html, content_type='text/html')