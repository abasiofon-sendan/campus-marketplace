from django.conf import settings
from supabase import create_client,Client

supabase_url:str = settings.SUPABASE_URL
supabase_secret:str = settings.SUPABASE_SECRET

supabase: Client = create_client(supabase_url,supabase_secret)