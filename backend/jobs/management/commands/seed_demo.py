from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.models import Job

class Command(BaseCommand):
    help = "Create demo recruiter, candidate, and sample job listings."
    def handle(self, *args, **options):
        User = get_user_model()
        recruiter, created = User.objects.get_or_create(
            email="recruiter@hirehub.demo",
            defaults={"username": "demo_recruiter", "role": "recruiter", "company": "HireHub Demo"}
        )
        if created:
            recruiter.set_password("HireHubDemo123!")
            recruiter.save()
        candidate, created = User.objects.get_or_create(
            email="candidate@hirehub.demo",
            defaults={"username": "demo_candidate", "role": "candidate", "headline": "Junior Software Developer"}
        )
        if created:
            candidate.set_password("HireHubDemo123!")
            candidate.save()
        samples = [
            ("Junior Python Developer", "BrightLabs", "Hyderabad, India", "full_time", "entry", 400000, 700000,
             "Build and maintain Python web services with guidance from senior engineers.",
             "Python basics, Django fundamentals, SQL, Git, and clear communication."),
            ("Frontend Developer Intern", "PixelForge", "Remote", "internship", "entry", 120000, 240000,
             "Help build accessible, responsive user interfaces and collaborate with product designers.",
             "HTML, CSS, JavaScript, React fundamentals, and willingness to learn."),
            ("Django Backend Engineer", "Northstar Tech", "Bengaluru, India", "full_time", "mid", 900000, 1500000,
             "Design APIs, improve query performance, and contribute to reliable backend services.",
             "Django REST Framework, PostgreSQL, API design, testing, and Git."),
            ("Associate Software Engineer", "CloudCove", "Chennai, India", "full_time", "entry", 500000, 850000,
             "Work across backend services and internal tools in a collaborative engineering team.",
             "One programming language, data structures, SQL, REST basics, and problem-solving."),
        ]
        for title, company, location, kind, experience, low, high, description, requirements in samples:
            Job.objects.get_or_create(
                recruiter=recruiter, title=title,
                defaults={"company": company, "location": location, "employment_type": kind,
                          "experience": experience, "salary_min": low, "salary_max": high,
                          "description": description, "requirements": requirements, "is_active": True}
            )
        self.stdout.write(self.style.SUCCESS("Demo data is ready."))
