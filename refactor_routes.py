import os
import re

# Mapping of class names to their singleton variable names
SERVICES = {
    'UniversityService': 'universityService',
    'HomeService': 'homeService',
    'SeoService': 'seoService',
    'BlogService': 'blogService',
    'FaqService': 'faqService',
    'ApplicationService': 'applicationService',
    'DiscoveryService': 'discoveryService',
    'ScholarshipService': 'scholarshipService',
    'CountryService': 'countryService',
    'DropdownService': 'dropdownService',
    'ExamService': 'examService',
    'FeedbackService': 'feedbackService',
    'InquiryService': 'inquiryService',
    'MalaysiaDiscoveryService': 'malaysiaDiscoveryService',
    'MalaysiaStatsService': 'malaysiaStatsService',
    'PartnerService': 'partnerService',
    'SearchApplyService': 'searchApplyService',
    'MultipleSearchApplyService': 'multipleSearchApplyService',
    'ServiceService': 'serviceService',
    'StatsService': 'statsService',
    'StudentAuthService': 'studentAuthService',
    'StudentProfileService': 'studentProfileService',
    'SitemapDataService': 'sitemapDataService',
    'SitemapService': 'sitemapService'
}

BASE_DIR = r'd:\NEXT\NextEducationMalaysia\src\app\api\v1'

def refactor_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        
        # 1. First, find all instantiations and the variable names they use
        # Example: const authService = new StudentAuthService();
        # We want to replace all occurrences of `authService` with `studentAuthService`
        
        inst_pattern = r'const\s+(\w+)\s*=\s*new\s+(\w+)\(\);?\s*'
        for var_name, cls_name in re.findall(inst_pattern, content):
            if cls_name in SERVICES:
                standard_name = SERVICES[cls_name]
                # Replace all usages of the old variable name with the standard singleton name
                # Avoid replacing the declaration itself for now (handled later)
                if var_name != standard_name:
                    content = re.sub(fr'\b{var_name}\b', standard_name, content)
                # Remove the instantiation line
                content = re.sub(fr'const\s+{standard_name}\s*=\s*new\s+{cls_name}\(\);?\s*', '', content)

        # 2. Update named imports from @/backend
        def replace_barrel_import(match):
            import_segment = match.group(1)
            for cls_name, inst_name in SERVICES.items():
                import_segment = re.sub(fr'\b{cls_name}\b', inst_name, import_segment)
            # Remove duplicates in case both were already there
            parts = [p.strip() for p in import_segment.split(',')]
            unique_parts = []
            seen = set()
            for p in parts:
                if p and p not in seen:
                    unique_parts.append(p)
                    seen.add(p)
            return f"import {{ {', '.join(unique_parts)} }} from {match.group(2)}@/backend{match.group(2)}"

        content = re.sub(r'import\s+\{\s*(.*?)\s*\}\s+from\s+([\'"])@/backend\2', replace_barrel_import, content, flags=re.DOTALL)

        # 3. Update relative imports
        for cls_name, inst_name in SERVICES.items():
            pattern = r'import\s+\{\s*' + re.escape(cls_name) + r'\s*\}\s+from\s+([\'"])(.*?)\1'
            replacement = r'import { ' + inst_name + r' } from \1\2\1'
            content = re.sub(pattern, replacement, content, flags=re.DOTALL)

        # 4. Standardize withMiddleware import
        content = content.replace(
            "import { withMiddleware } from '@/backend/middleware';",
            "import { withMiddleware } from '@/backend/middleware/with-middleware';"
        )

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    modified_count = 0
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file == 'route.ts':
                full_path = os.path.join(root, file)
                if refactor_file(full_path):
                    print(f"Refactored: {full_path}")
                    modified_count += 1
    
    print(f"\nTotal routes refactored/updated: {modified_count}")

if __name__ == "__main__":
    main()
