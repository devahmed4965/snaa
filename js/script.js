/**
 * Sanaa Academy Platform - Main JavaScript File
 *
 * Handles language switching, animations (Intersection Observer),
 * mobile menu, sticky header, dynamic header UI (with Sections dropdown logic),
 * and other dynamic behaviors including loading price plans for index.html.
 * Version: 3.6 (Finalized with all translations and functions)
 */

// Create a global namespace for the app's functions and data
window.sanaApp = {

    // --- Language Data ---
    translations: {
        'ar': {
            // --- General ---
            'meta_description_base': 'منصة سنا الأكاديمية: بوابتك لتعلم الدراسات الإسلامية، اللغة العربية، والقرآن الكريم عبر الإنترنت.',
            'view_details': 'عرض التفاصيل',
            'view_schedule': 'عرض الجدول',
            'read_more': 'اقرأ المزيد',
            'send_message': 'إرسال الرسالة',
            'zoom_link': 'رابط زوم',
            'loading': 'جار التحميل...',
            'search_placeholder': 'ابحث عن محاضرة...',
            'signup_yes': 'نعم',
            'signup_no': 'لا',
            'profile_value_not_set': 'لم يتم التعيين',
            'role_student': 'طالب',
            'role_teacher': 'مدرس',
            'role_admin': 'مدير',
            'coming_soon': '(قريباً)',
            'error_loading_data': 'حدث خطأ أثناء تحميل البيانات.',
            'no_sections_available': 'لا توجد أقسام متاحة حاليًا.',
            'select_plan': 'اختر الخطة',

            // --- Navigation & Sections ---
            'nav_home': 'الرئيسية',
            'nav_about': 'عن سنا',
            'nav_lectures': 'المحاضرات',
            'nav_sections': 'الأقسام',
            'nav_schedule': 'الجدول الزمني',
            'nav_contact': 'تواصل',
            'nav_login': 'تسجيل الدخول',
            'nav_signup': 'إنشاء حساب',
            'nav_profile': 'ملفي الشخصي',
            'nav_dashboard': 'لوحة التحكم',
            'nav_admin_dashboard': 'لوحة تحكم المدير',
            'nav_logout': 'تسجيل الخروج',
            'section_podcast': 'البودكاست',
            'section_audio': 'الصوتيات',
            'section_mushaf': 'المصحف الإلكتروني',
            'section_muhafiz': 'المحفظ الإلكتروني',
            'section_books': 'الكتب الدينية',
            'section_dictionaries': 'معاجم اللغة',
            'section_prophets_stories': 'قصص الأنبياء',
            'section_seerah': 'السيرة النبوية',
            'section_ai_learning': 'التعلم بالذكاء الاصطناعي',

            // --- Footer ---
            'footer_rights': 'منصة سنا الأكاديمية. جميع الحقوق محفوظة.',
            'footer_privacy': 'سياسة الخصوصية',
            'footer_terms': 'شروط الاستخدام',
            'footer_contact': 'تواصل معنا',

            // --- Index Page ---
            'title_index': 'منصة سنا الأكاديمية | الرئيسية',
            'hero_title_main': 'منصة سنا الأكاديمية',
            'hero_subtitle_platform': 'بوابتك لتعلّم الإسلام واللغة العربية والقرآن',
            'subject_islamic': 'الدراسات الإسلامية',
            'subject_arabic': 'اللغة العربية',
            'subject_quran': 'القرآن الكريم',
            'hero_cta': 'اكتشف المحاضرات الآن',
            'about_section_title': 'ما هي منصة سنا؟',
            'about_section_text': 'منصة "سنا" هي مبادرة تعليمية تهدف إلى تقديم فهم عميق وشامل لعلوم الدين الإسلامي للناطقين بغير العربية. نسعى لتبسيط المفاهيم وتقديمها بأسلوب يجمع بين الأصالة والمعاصرة، مع التركيز على القيم الأساسية للإسلام كدين رحمة وحكمة.',
            'about_section_cta': 'اعرف المزيد عنا',
            'intro_video_title': 'مرحبًا بكم في أكاديمية سنا!',
            'getting_started_title': 'خريطة البدء وأقسامنا',
            'getting_started_map_placeholder': '(خريطة البدء - سيتم إضافة تصميم تفاعلي هنا)',
            'featured_lectures_title': 'محاضرات مميزة',
            'lecture1_title': 'مدخل إلى العقيدة الإسلامية',
            'lecture1_desc': 'نظرة شاملة على أركان الإيمان وأهم المفاهيم الأساسية في العقيدة الإسلامية.',
            'lecture2_title': 'أساسيات الفقه (العبادات)',
            'lecture2_desc': 'شرح مبسط لأحكام الطهارة، الصلاة، الزكاة، والصيام وكيفية أدائها بشكل صحيح.',
            'lecture3_title_quran': 'مقدمة في علوم القرآن',
            'lecture3_desc_quran': 'تعلم أساسيات التجويد وفهم المعاني الأساسية لآيات القرآن الكريم.',
            'all_lectures_cta': 'عرض كل المحاضرات',
            'testimonials_title': 'آراء طلابنا',
            'gallery_title': 'الشهادات والإنجازات',
            'gallery_subtitle': 'نفخر بطلابنا المتميزين وشهاداتهم',
            'cta_section_title': 'جاهزون للبدء في رحلتكم التعليمية؟',
            'cta_section_subtitle': 'انضموا إلى محاضراتنا المباشرة عبر زوم وتفاعلوا مع المحاضرين المؤهلين.',
            'cta_section_button': 'اطلع على الجدول الزمني',
            'intro_video_load_error': "(تعذر تحميل الفيديو التعريفي)",
            'intro_video_not_set': "(لم يتم رفع الفيديو التعريفي بعد)",
            'no_testimonials_found': "(لا توجد آراء حالياً)",
            'testimonial_load_error': "(خطأ في تحميل الآراء)",
            'no_certificates_found': "(لا توجد شهادات لعرضها)",
            'certificate_load_error': "(خطأ في تحميل الشهادات)",
            'price_plans_title': 'خطط الأسعار والعروض',
            'no_price_plans_found': 'لا توجد خطط أسعار متاحة حالياً.',
            'price_free': 'مجاني',
            'billing_period_monthly': 'شهرياً',
            'billing_period_yearly': 'سنوياً',
            'billing_period_onetime': 'مرة واحدة',
            'plan_basic_name': 'الخطة الأساسية',
            'plan_basic_desc': 'وصف قصير للخطة الأساسية.',
            'plan_standard_name': 'الخطة القياسية',
            'plan_standard_desc': 'وصف قصير للخطة القياسية.',
            'plan_premium_name': 'الخطة المميزة',
            'plan_premium_desc': 'وصف قصير للخطة المميزة.',
            'feature_access_limited': 'وصول محدود للمحتوى',
            'feature_community_access': 'وصول لمنتدى المجتمع',
            'feature_access_all': 'وصول كامل لجميع المحتويات',
            'feature_download_materials': 'تحميل المواد التعليمية',
            'feature_personal_support': 'دعم شخصي مباشر',


            // --- About Page ---
            'title_about': 'عن سنا | منصة سنا الأكاديمية',
            'about_page_title': 'تعرف على منصة سنا',
            'about_page_subtitle': 'رسالتنا، رؤيتنا، وقيمنا التي تقود عملنا نحو تعليم إسلامي أصيل وميسر.',
            'about_mission_title': 'رسالتنا',
            'about_mission_text': 'تقديم محتوى تعليمي إسلامي موثوق وسهل الفهم للناطقين بغير العربية، باستخدام أساليب تعليمية حديثة وتفاعلية، لتعزيز الفهم الصحيح للإسلام وقيمه السمحة.',
            'about_vision_title': 'رؤيتنا',
            'about_vision_text': 'أن نكون المنصة الرائدة عالميًا في تعليم علوم الدين الإسلامي للأجانب، وبناء جسور من التواصل والفهم الحضاري بين الثقافات المختلفة.',
            'about_values_title': 'قيمنا',
            'about_values_list': '<li class="flex items-center justify-center md:justify-start rtl:md:justify-end"><svg class="w-4 h-4 text-yellow-500 ml-2 rtl:ml-0 rtl:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>الأصالة والموثوقية</li><li class="flex items-center justify-center md:justify-start rtl:md:justify-end"><svg class="w-4 h-4 text-yellow-500 ml-2 rtl:ml-0 rtl:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>الوسطية والاعتدال</li><li class="flex items-center justify-center md:justify-start rtl:md:justify-end"><svg class="w-4 h-4 text-yellow-500 ml-2 rtl:ml-0 rtl:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>الوضوح والتبسيط</li><li class="flex items-center justify-center md:justify-start rtl:md:justify-end"><svg class="w-4 h-4 text-yellow-500 ml-2 rtl:ml-0 rtl:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>الاحترام والتفاعل</li><li class="flex items-center justify-center md:justify-start rtl:md:justify-end"><svg class="w-4 h-4 text-yellow-500 ml-2 rtl:ml-0 rtl:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>الإتقان والجودة</li>',
            'about_instructors_title': 'محاضرونا',
            'instructor1_name': 'اسم المحاضر الأول',
            'instructor1_spec': 'التخصص (مثال: فقه وعقيدة)',
            'instructor1_bio': 'نبذة مختصرة عن خبرات المحاضر ومؤهلاته العلمية، مع التركيز على خبرته في التدريس للأجانب.',
            'instructor2_name': 'اسم المحاضر الثاني',
            'instructor2_spec': 'التخصص (مثال: سيرة وتفسير)',
            'instructor2_bio': 'نبذة مختصرة عن خبرات المحاضر ومؤهلاته العلمية، مع التركيز على خبرته في التدريس للأجانب.',
            'instructor3_name': 'اسم المحاضر الثالث',
            'instructor3_spec': 'التخصص (مثال: لغة عربية وعلوم قرآن)',
            'instructor3_bio': 'نبذة مختصرة عن خبرات المحاضر ومؤهلاته العلمية، مع التركيز على خبرته في التدريس للأجانب.',

            // --- Lectures Page ---
            'title_lectures': 'المحاضرات | منصة سنا الأكاديمية',
            'lectures_page_title': 'محاضراتنا ودوراتنا',
            'lectures_page_subtitle': 'استكشف مجموعة متنوعة من المواضيع في علوم الدين الإسلامي المصممة خصيصًا للمبتدئين.',
            'lecture_cat_aqidah': 'عقيدة',
            'lecture1_desc_long': 'نظرة شاملة على أركان الإيمان (الإيمان بالله، وملائكته، وكتبه، ورسله، واليوم الآخر، والقدر خيره وشره). شرح مبسط لأهم المفاهيم الأساسية في العقيدة الإسلامية ومكانتها.',
            'lecture_target_audience_title': 'لمن هذه الدورة؟',
            'lecture1_target_audience': 'للمبتدئين والراغبين في فهم أسس الدين الإسلامي بشكل صحيح.',
            'lecture_highlights_title': 'مقتطفات من المحتوى:',
            'lecture1_highlights': '<li>مفهوم التوحيد وأقسامه.</li><li>أهمية الإيمان بالرسل والكتب السماوية.</li><li>لمحة عن اليوم الآخر وعلاماته.</li>',
            'lecture_cat_fiqh': 'فقه',
            'lecture2_desc_long': 'شرح عملي ومبسط لأحكام الطهارة (الوضوء، الغسل، التيمم)، الصلاة (أركانها، واجباتها، سننها)، الزكاة (شروطها، مصارفها)، والصيام (أحكامه ومبطلاته).',
            'lecture2_target_audience': 'لكل مسلم يرغب في تعلم كيفية أداء العبادات الأساسية بشكل صحيح.',
            'lecture2_highlights': '<li>خطوات الوضوء الصحيحة.</li><li>كيفية أداء الصلاة خطوة بخطوة.</li><li>أهمية الزكاة وشروط وجوبها.</li>',
            'lecture_cat_seerah': 'سيرة',
            'lecture3_title': 'دروس من السيرة النبوية',
            'lecture3_desc_long': 'استعراض لأبرز محطات حياة النبي محمد ﷺ منذ ولادته وحتى وفاته، مع التركيز على الدروس التربوية والأخلاقية والقيم المستفادة من مواقفه وأحداث حياته.',
            'lecture3_target_audience': 'للراغبين في التعرف على نبي الإسلام ﷺ والاقتداء بأخلاقه ومنهجه.',
            'lecture3_highlights': '<li>أخلاق النبي ﷺ في التعامل مع الناس.</li><li>مواقف من صبره وحكمته.</li><li>بناء المجتمع المسلم في المدينة.</li>',
            'lecture_cat_tafsir': 'تفسير',
            'lecture4_title': 'مقدمة في علوم القرآن والتفسير',
            'lecture4_desc_long': 'مدخل إلى علوم القرآن الكريم، كيفية نزوله وجمعه، وأهم مناهج المفسرين في فهم وتدبر آياته. تطبيق عملي على تفسير بعض السور القصيرة.',
            'lecture4_target_audience': 'لمهتمي فهم القرآن الكريم وأصول تفسيره.',
            'lecture4_highlights': '<li>الفرق بين التفسير والتأويل.</li><li>أنواع التفسير (بالمأثور، بالرأي).</li><li>تفسير سورة الفاتحة.</li>',

            // --- Schedule Page ---
            'title_schedule': 'الجدول الزمني | منصة سنا الأكاديمية',
            'schedule_page_title': 'الجدول الزمني للمحاضرات',
            'schedule_page_subtitle': 'انضم إلينا في محاضراتنا المباشرة عبر زوم',
            'schedule_timezone_note': '(جميع المواعيد بتوقيت غرينتش GMT)',
            'schedule_th_day': 'اليوم',
            'schedule_th_time': 'الوقت (GMT)',
            'schedule_th_lecture': 'المحاضرة',
            'schedule_th_join': 'التسجيل / الانضمام',
            'schedule_day_monday': 'الإثنين',
            'schedule_lecture_aqidah1': 'مدخل إلى العقيدة الإسلامية (الجزء 1)',
            'schedule_day_tuesday': 'الثلاثاء',
            'schedule_lecture_fiqh': 'أساسيات الفقه: الطهارة والصلاة',
            'schedule_day_wednesday': 'الأربعاء',
            'schedule_lecture_aqidah2': 'مدخل إلى العقيدة الإسلامية (الجزء 2)',
            'schedule_day_thursday': 'الخميس',
            'schedule_lecture_seerah': 'دروس من السيرة النبوية: مكة',
            'schedule_day_friday': 'الجمعة',
            'schedule_no_lecture': 'لا توجد محاضرة مجدولة',
            'schedule_day_saturday': 'السبت',
            'schedule_lecture_tafsir': 'مقدمة في علوم القرآن والتفسير',
            'schedule_day_sunday': 'الأحد',
            'schedule_notes_title': 'ملاحظات هامة:',
            'schedule_notes_list': '<li>قد تتغير المواعيد، يرجى مراجعة هذه الصفحة بانتظام.</li><li>تأكد من تحميل برنامج زوم وتجربته قبل موعد المحاضرة.</li><li>للاستفسارات حول الجدول، يرجى <a href="contact.html" class="text-emerald-600 hover:text-emerald-800 font-medium hover:underline">التواصل معنا</a>.</li><li>سيتم إضافة تسجيلات المحاضرات السابقة قريباً في قسم المحاضرات.</li>',

            // --- Contact Page ---
            'title_contact': 'تواصل معنا | منصة سنا الأكاديمية',
            'contact_page_title': 'تواصل معنا',
            'contact_page_subtitle': 'نسعد بتلقي استفساراتكم ومقترحاتكم. نحن هنا للمساعدة!',
            'contact_info_title': 'معلومات التواصل',
            'contact_email_title': 'البريد الإلكتروني',
            'contact_email_desc': 'للإستفسارات العامة والدعم الفني.',
            'contact_phone_title': 'الهاتف / واتساب (اختياري)',
            'contact_phone_desc': 'للتواصل السريع (يرجى مراعاة فروق التوقيت).',
            'contact_address_title': 'العنوان (اختياري)',
            'contact_address_text': 'اسم الشارع، المدينة، الدولة',
            'contact_address_desc': 'للمراسلات البريدية (إذا لزم الأمر).',
            'contact_social_title': 'تابعنا على:',
            'contact_form_title': 'أرسل لنا رسالة',
            'contact_form_name': 'الاسم الكامل',
            'contact_form_name_placeholder': 'اسمك الكامل',
            'contact_form_email': 'البريد الإلكتروني',
            'contact_form_email_placeholder': 'you@example.com',
            'contact_form_subject': 'الموضوع',
            'contact_form_subject_placeholder': 'موضوع رسالتك',
            'contact_form_message': 'الرسالة',
            'contact_form_message_placeholder': 'اكتب رسالتك هنا...',
            'contact_form_submit': 'إرسال الرسالة',
            'contact_form_note_formspree': "(يتم إرسال هذا النموذج عبر Formspree. قد تحتاج إلى تأكيد بريدك الإلكتروني.)",
            'contact_form_success_ar': 'تم إرسال رسالتك بنجاح!',
            'contact_form_error_ar': 'حدث خطأ. يرجى المحاولة مرة أخرى.',

            // --- Login Page ---
            'login_title': 'تسجيل الدخول إلى حسابك',
            'login_subtitle': 'أو',
            'login_create_account_link': 'قم بإنشاء حساب جديد',
            'login_email_label': 'البريد الإلكتروني',
            'login_password_label': 'كلمة المرور',
            'login_forgot_password_link': 'نسيت كلمة المرور؟',
            'login_button': 'تسجيل الدخول',
            'login_or_continue_with': 'أو المتابعة بواسطة',

            // --- Signup Page ---
            'signup_title': 'إنشاء حساب جديد',
            'signup_subtitle': 'أو',
            'signup_login_link': 'قم بتسجيل الدخول إذا كان لديك حساب',
            'signup_section_basic': 'المعلومات الأساسية',
            'signup_fullname_label': 'الاسم الكامل',
            'signup_email_label': 'البريد الإلكتروني',
            'signup_password_label': 'كلمة المرور',
            'signup_password_confirm_label': 'تأكيد كلمة المرور',
            'signup_age_label': 'السن',
            'signup_gender_label': 'النوع',
            'signup_gender_select': '-- اختر --',
            'signup_gender_male': 'ذكر',
            'signup_gender_female': 'أنثى',
            'signup_gender_other': 'آخر',
            'signup_gender_prefer_not': 'أفضل عدم القول',
            'signup_section_knowledge': 'مستوى المعرفة الدينية',
            'signup_knowledge_islam_label': 'معرفتك العامة بالإسلام؟',
            'signup_level_select': '-- اختر المستوى --',
            'signup_level_beginner': 'مبتدئ / لا أعرف شيئاً',
            'signup_level_intermediate': 'متوسط / لدي بعض المعلومات',
            'signup_level_advanced': 'متقدم / لدي معرفة جيدة',
            'signup_knowledge_quran_label': 'معرفتك بالقرآن الكريم؟',
            'signup_quran_select': '-- اختر المستوى --',
            'signup_quran_none': 'لا أعرف القراءة',
            'signup_quran_basic': 'أستطيع القراءة ببطء',
            'signup_quran_fluent': 'أقرأ بطلاقة',
            'signup_quran_tajweed': 'أعرف بعض أحكام التجويد',
            'signup_quran_memorization': 'أحفظ بعض السور',
            'signup_knowledge_new_muslim_label': 'هل أنت حديث عهد بالإسلام؟',
            'signup_section_goals': 'الأهداف والتعريف بالمنصة',
            'signup_aspirations_label': 'ما هي طموحاتك أو ما الذي تأمل في تعلمه؟',
            'signup_how_heard_label': 'كيف عرفت عن منصة سنا؟',
            'signup_how_heard_select': '-- اختر --',
            'signup_how_heard_friend': 'عن طريق صديق',
            'signup_how_heard_social': 'وسائل التواصل الاجتماعي (فيسبوك، تويتر، ..)',
            'signup_how_heard_search': 'محرك البحث (جوجل، ..)',
            'signup_how_heard_website': 'موقع إلكتروني آخر / مدونة',
            'signup_how_heard_other': 'أخرى (يرجى التوضيح في الطموحات)',
            'signup_button': 'إنشاء الحساب',
            'signup_or_continue_with': 'أو التسجيل بواسطة',

            // --- Profile Page ---
            'profile_name_placeholder': 'اسم الطالب الكامل',
            'profile_email_placeholder': 'student.email@example.com',
            'profile_edit_button': 'تعديل الملف الشخصي',
            'profile_section_details': 'تفاصيل الحساب',
            'profile_label_fullname': 'الاسم الكامل:',
            'profile_label_email': 'البريد الإلكتروني:',
            'profile_label_phone': 'رقم الهاتف:',
            'profile_label_whatsapp': 'واتساب:',
            'profile_label_age': 'السن:',
            'profile_label_gender': 'النوع:',
            'profile_section_courses': 'الكورسات المشترك بها',
            'profile_no_courses': 'لم تشترك في أي كورسات بعد.',
            'profile_section_links': 'روابط المحاضرات',
            'profile_no_links': 'لا توجد روابط حالياً.',
            'edit_profile_title': 'تعديل الملف الشخصي',
            'edit_profile_avatar_label': 'تغيير الصورة الشخصية (اختياري):',
            'edit_profile_avatar_note': 'الحجم الأقصى: 2MB. الصيغ المسموحة: JPG, PNG, GIF.',
            'edit_profile_fullname_label': 'الاسم الكامل:',
            'edit_profile_phone_label': 'رقم الهاتف (اختياري):',
            'edit_profile_whatsapp_label': 'رقم الواتساب (اختياري):',
            'edit_profile_cancel_button': 'إلغاء',
            'edit_profile_save_button': 'حفظ التغييرات',

            // --- Teacher Dashboard ---
            'teacher_dashboard_title': 'لوحة تحكم المدرس',
            'teacher_assigned_students': 'الطلاب المسجلون:',
            'teacher_no_students': 'لا يوجد طلاب مسجلون في هذا الكورس حالياً.',
            'teacher_send_link_title': 'إرسال رابط للطلاب',
            'teacher_select_course': 'اختر الكورس:',
            'teacher_select_course_placeholder': '-- اختر الكورس --',
            'teacher_link_url': 'رابط المحاضرة/المادة:',
            'teacher_link_description': 'وصف الرابط (اختياري):',
            'teacher_send_button': 'إرسال الرابط للطلاب',
            'teacher_link_sent_success': 'تم إرسال الرابط بنجاح!',
            'teacher_link_sent_error': 'حدث خطأ أثناء إرسال الرابط.',

            // --- Admin Dashboard ---
            'admin_dashboard_title': 'لوحة تحكم المدير',
            'admin_manage_users_title': 'إدارة المستخدمين',
            'admin_add_user_button': 'إضافة مستخدم',
            'admin_table_header_name': 'الاسم',
            'admin_table_header_email': 'البريد الإلكتروني',
            'admin_table_header_role': 'الدور',
            'admin_table_header_actions': 'الإجراءات',
            'admin_action_edit': 'تعديل',
            'admin_action_delete': 'حذف',
            'admin_manage_courses_title': 'إدارة الكورسات',
            'admin_add_course_button': 'إضافة كورس',
            'admin_table_header_course_name': 'اسم الكورس',
            'admin_table_header_instructor': 'المدرس المسؤول',
            'admin_table_header_students_enrolled': 'عدد الطلاب',
            'admin_action_assign_users': 'تعيين',
            'admin_assign_users_title': 'تعيين المستخدمين للكورسات',
            'admin_assign_select_course': 'اختر الكورس:',
            'admin_assign_select_user': 'اختر المستخدم:',
            'admin_assign_button': 'تعيين',
            'admin_assign_note': 'ملاحظة: عند تعيين مدرس لكورس، سيتم تعيينه كمدرس مسؤول. عند تعيين طالب، سيتم إضافته لقائمة طلاب الكورس.',
            'admin_delete_confirm': 'هل أنت متأكد من حذف المستخدم %USER%؟',
            'admin_delete_course_confirm': 'هل أنت متأكد من حذف الكورس %COURSE%؟ سيؤدي هذا أيضًا إلى إلغاء تسجيل الطلاب.',
            'admin_modal_add_user_title': 'إضافة مستخدم جديد',
            'admin_modal_edit_user_title': 'تعديل بيانات المستخدم',
            'admin_modal_password_note_add': 'مطلوبة للمستخدم الجديد.',
            'admin_modal_password_placeholder_edit': 'اتركه فارغاً لعدم التغيير',
            'admin_modal_password_note_edit': 'أدخل كلمة مرور جديدة فقط إذا كنت تريد تغييرها.',
            'admin_modal_save_button': 'حفظ',
            'admin_modal_add_course_title': 'إضافة كورس جديد',
            'admin_modal_edit_course_title': 'تعديل بيانات الكورس',
            'admin_modal_course_title_key': 'مفتاح عنوان الكورس:',
            'admin_modal_translation_key_note': 'يُستخدم للترجمة في ملف script.js.',
            'admin_modal_course_desc_key': 'مفتاح وصف الكورس:',
            'admin_modal_course_cat_key': 'مفتاح تصنيف الكورس:',
            'admin_modal_course_image_url': 'رابط صورة الكورس (اختياري):',
            'admin_modal_course_instructor': 'المدرس المسؤول (اختياري):',
            'admin_modal_select_instructor': '-- اختر مدرس --',
            'admin_manage_sections_title': 'إدارة أقسام المنصة',
            'admin_add_section_button': 'إضافة قسم',
            'admin_section_header_name': 'اسم القسم (المفتاح)',
            'admin_section_header_icon': 'فئة الأيقونة',
            'admin_section_header_path': 'المسار (Path)',
            'admin_section_header_order': 'الترتيب',
            'admin_section_header_active': 'نشط',
            'admin_modal_add_section_title': 'إضافة قسم جديد',
            'admin_modal_edit_section_title': 'تعديل بيانات القسم',
            'admin_section_icon_note': 'اسم الفئة CSS للأيقونة (مثل Font Awesome).',
            'admin_section_path_note': 'المسار في الرابط (أحرف صغيرة، بدون مسافات).',
            'admin_no_users_message': "لا يوجد مستخدمون لعرضهم.",
            'admin_no_courses_message': "لا توجد كورسات لعرضها.",
            'admin_no_sections_message': "لا توجد أقسام لعرضها.",
            'admin_manage_price_plans_title': "إدارة خطط الأسعار",
            'admin_add_price_plan_button': "إضافة خطة سعر",
            'admin_price_plan_header_name': "اسم الخطة (المفتاح)",
            'admin_price_plan_header_price': "السعر",
            'admin_price_plan_header_currency': "العملة",
            'admin_price_plan_header_billing': "فترة الفوترة",
            'admin_price_plan_header_active': "نشطة",
            'admin_price_plan_header_featured': "مميزة",
            'admin_no_price_plans_message': "لا توجد خطط أسعار لعرضها.",
            'admin_modal_add_price_plan_title': "إضافة خطة سعر جديدة",
            'admin_modal_edit_price_plan_title': "تعديل خطة السعر",
            'admin_price_plan_label_name_key': "مفتاح اسم الخطة:",
            'admin_price_plan_label_desc_key': "مفتاح وصف الخطة (اختياري):",
            'admin_price_plan_label_price': "السعر:",
            'admin_price_plan_label_currency': "العملة:",
            'admin_price_plan_label_billing': "فترة الفوترة:",
            'admin_price_plan_label_features': "مفاتيح الميزات (مفصولة بفاصلة):",
            'admin_price_plan_label_course_id': "معرف الكورس (اختياري):",
            'admin_price_plan_label_order': "ترتيب العرض:",
            'admin_price_plan_label_active': "نشطة:",
            'admin_price_plan_label_featured': "مميزة:",
            'admin_modal_cancel_button': "إلغاء",
            'admin_manage_intro_video_title': "إدارة الفيديو التعريفي",
            'admin_intro_video_label': "رفع فيديو جديد (MP4, WebM, Ogg):",
            'admin_intro_video_note': "سيحل الفيديو الجديد محل الفيديو الحالي.",
            'admin_intro_video_current': "الفيديو الحالي:",
            'admin_intro_video_none': "لا يوجد فيديو حالي.",
            'admin_intro_video_upload_button': "رفع وتحديث الفيديو",
            'admin_manage_podcasts_title': "إدارة البودكاست",
            'admin_add_podcast_button': "إضافة بودكاست",
            'admin_podcast_header_title': "العنوان",
            'admin_podcast_header_thumbnail': "الصورة المصغرة",
            'admin_podcast_header_duration': "المدة",
            'admin_podcast_header_published': "تاريخ النشر",
            'admin_no_podcasts_message': "لا توجد حلقات بودكاست لعرضها.",
            'admin_podcast_label_title': "عنوان البودكاست:",
            'admin_podcast_label_desc': "الوصف (اختياري):",
            'admin_podcast_label_duration': "المدة (بالثواني، اختياري):",
            'admin_podcast_label_published': "تاريخ النشر (اختياري):",
            'admin_podcast_label_audio': "ملف الصوت (MP3, WAV, OGG):",
            'admin_podcast_label_thumbnail': "الصورة المصغرة (اختياري):",
            'admin_manage_books_title': "إدارة الكتب",
            'admin_add_book_button': "إضافة كتاب",
            'admin_book_header_cover': "الغلاف",
            'admin_book_header_title': "العنوان",
            'admin_book_header_author': "المؤلف",
            'admin_book_header_category': "التصنيف",
            'admin_book_header_file': "ملف",
            'admin_no_books_message': "لا توجد كتب لعرضها.",
            'admin_book_label_title': "عنوان الكتاب:",
            'admin_book_label_author': "المؤلف (اختياري):",
            'admin_book_label_category': "التصنيف (اختياري):",
            'admin_book_label_desc': "الوصف (اختياري):",
            'admin_book_label_year': "سنة النشر (اختياري):",
            'admin_book_label_cover': "صورة الغلاف (اختياري):",
            'admin_book_label_file': "ملف الكتاب (PDF, EPUB - اختياري):",
            'admin_manage_audio_title': "إدارة الصوتيات",
            'admin_add_audio_button': "إضافة ملف صوتي",
            'admin_audio_header_title': "العنوان",
            'admin_audio_header_speaker': "المتحدث",
            'admin_audio_header_category': "التصنيف",
            'admin_audio_header_duration': "المدة",
            'admin_no_audio_message': "لا توجد ملفات صوتية لعرضها.",
            'admin_audio_label_title': "عنوان الملف الصوتي:",
            'admin_audio_label_speaker': "اسم المتحدث (اختياري):",
            'admin_audio_label_category': "التصنيف (اختياري):",
            'admin_audio_label_desc': "الوصف (اختياري):",
            'admin_audio_label_duration': "المدة (بالثواني، اختياري):",
            'admin_audio_label_file': "ملف الصوت (MP3, WAV, OGG):",
            'admin_manage_stories_title': "إدارة القصص والسيرة",
            'admin_add_story_button': "إضافة قصة/سيرة",
            'admin_story_header_title': "العنوان",
            'admin_story_header_category': "التصنيف",
            'admin_story_header_image': "الصورة",
            'admin_no_stories_message': "لا توجد قصص أو سيرة لعرضها.",
            'admin_story_label_title': "العنوان:",
            'admin_story_label_category': "التصنيف:",
            'admin_story_category_prophets': "قصص الأنبياء",
            'admin_story_category_seerah': "السيرة النبوية",
            'admin_story_category_other': "أخرى",
            'admin_story_label_content': "المحتوى:",
            'admin_story_label_image': "صورة (اختياري):",
            'admin_manage_dictionary_title': "إدارة المعجم",
            'admin_add_dictionary_entry_button': "إضافة مصطلح",
            'admin_dictionary_header_term': "المصطلح",
            'admin_dictionary_header_definition': "التعريف (مقتطف)",
            'admin_dictionary_header_root': "الجذر",
            'admin_no_dictionary_entries_message': "لا توجد مصطلحات في المعجم لعرضها.",
            'admin_dictionary_label_term': "المصطلح:",
            'admin_dictionary_label_definition': "التعريف:",
            'admin_dictionary_label_root': "الجذر (اختياري):",
            'admin_dictionary_label_example': "مثال (اختياري):",
            'admin_manage_testimonials_title': "إدارة آراء الطلاب",
            'admin_add_testimonial_button': "إضافة رأي",
            'admin_testimonial_header_avatar': "الصورة",
            'admin_testimonial_header_name': "اسم الطالب",
            'admin_testimonial_header_text': "نص الرأي (مقتطف)",
            'admin_testimonial_header_approved': "موافق عليه",
            'admin_no_testimonials_message': "لا توجد آراء طلاب لعرضها.",
            'admin_testimonial_label_name': "اسم الطالب:",
            'admin_testimonial_label_text': "نص الرأي:",
            'admin_testimonial_label_detail': "تفاصيل الطالب (اختياري):",
            'admin_testimonial_label_avatar': "صورة الطالب (اختياري):",
            'admin_testimonial_label_approved': "موافق عليه للعرض العام:",
            'admin_manage_certificates_title': "إدارة الشهادات",
            'admin_add_certificate_button': "إضافة شهادة",
            'admin_certificate_header_image': "صورة الشهادة",
            'admin_certificate_header_student': "اسم الطالب",
            'admin_certificate_header_course': "الكورس",
            'admin_certificate_header_date': "تاريخ الإصدار",
            'admin_no_certificates_message': "لا توجد شهادات لعرضها.",
            'admin_certificate_label_student': "اسم الطالب:",
            'admin_certificate_label_course': "اسم الكورس (اختياري):",
            'admin_certificate_label_date': "تاريخ الإصدار (اختياري):",
            'admin_certificate_label_image': "صورة الشهادة (مطلوبة):",
            'admin_delete_user_success': 'تم حذف المستخدم بنجاح.',
            'admin_delete_user_fail': 'فشل حذف المستخدم.',
            'admin_delete_course_success': 'تم حذف الكورس بنجاح.',
            'admin_delete_course_fail': 'فشل حذف الكورس.',
            'admin_delete_section_confirm': 'هل أنت متأكد من حذف القسم %ENTITY%؟',
            'admin_delete_section_success': 'تم حذف القسم بنجاح.',
            'admin_delete_section_fail': 'فشل حذف القسم.',
            'admin_delete_price_plan_confirm': "هل أنت متأكد من حذف خطة السعر '%ENTITY%'؟",
            'admin_delete_price_plan_success': 'تم حذف خطة السعر بنجاح.',
            'admin_delete_price_plan_fail': 'فشل حذف خطة السعر.',
            'admin_delete_podcast_confirm': "هل أنت متأكد من حذف البودكاست '%ENTITY%'؟",
            'admin_delete_podcast_success': 'تم حذف البودكاست بنجاح.',
            'admin_delete_podcast_fail': 'فشل حذف البودكاست.',
            'admin_delete_book_confirm': "هل أنت متأكد من حذف الكتاب '%ENTITY%'؟",
            'admin_delete_book_success': 'تم حذف الكتاب بنجاح.',
            'admin_delete_book_fail': 'فشل حذف الكتاب.',
            'admin_delete_audio_confirm': "هل أنت متأكد من حذف الملف الصوتي '%ENTITY%'؟",
            'admin_delete_audio_success': 'تم حذف الملف الصوتي بنجاح.',
            'admin_delete_audio_fail': 'فشل حذف الملف الصوتي.',
            'admin_delete_story_confirm': "هل أنت متأكد من حذف القصة/السيرة '%ENTITY%'؟",
            'admin_delete_story_success': 'تم حذف القصة/السيرة بنجاح.',
            'admin_delete_story_fail': 'فشل حذف القصة/السيرة.',
            'admin_delete_dictionary_confirm': "هل أنت متأكد من حذف مصطلح '%ENTITY%' من المعجم؟",
            'admin_delete_dictionary_success': 'تم حذف المصطلح من المعجم بنجاح.',
            'admin_delete_dictionary_fail': 'فشل حذف المصطلح من المعجم.',
            'admin_delete_testimonial_confirm': "هل أنت متأكد من حذف رأي الطالب '%ENTITY%'؟",
            'admin_delete_testimonial_success': 'تم حذف رأي الطالب بنجاح.',
            'admin_delete_testimonial_fail': 'فشل حذف رأي الطالب.',
            'admin_delete_certificate_confirm': "هل أنت متأكد من حذف شهادة الطالب '%ENTITY%'؟",
            'admin_delete_certificate_success': 'تم حذف الشهادة بنجاح.',
            'admin_delete_certificate_fail': 'فشل حذف الشهادة.',
        },
        'en': {
            // --- General ---
            'meta_description_base': 'Sanaa Academy Platform: Your gateway to learning Islamic Studies, Arabic, and the Holy Quran online.',
            'view_details': 'View Details',
            'view_schedule': 'View Schedule',
            'read_more': 'Read More',
            'send_message': 'Send Message',
            'zoom_link': 'Zoom Link',
            'loading': 'Loading...',
            'search_placeholder': 'Search for a lecture...',
            'signup_yes': 'Yes',
            'signup_no': 'No',
            'profile_value_not_set': 'Not Set',
            'role_student': 'Student',
            'role_teacher': 'Teacher',
            'role_admin': 'Admin',
            'coming_soon': '(Coming Soon)',
            'error_loading_data': 'Error loading data.',
            'no_sections_available': 'No sections currently available.',
            'select_plan': 'Select Plan',

            // --- Navigation & Sections ---
            'nav_home': 'Home',
            'nav_about': 'About Sana',
            'nav_lectures': 'Lectures',
            'nav_sections': 'Sections',
            'nav_schedule': 'Schedule',
            'nav_contact': 'Contact',
            'nav_login': 'Login',
            'nav_signup': 'Sign Up',
            'nav_profile': 'My Profile',
            'nav_dashboard': 'Dashboard',
            'nav_admin_dashboard': 'Admin Dashboard',
            'nav_logout': 'Logout',
            'section_podcast': 'Podcasts',
            'section_audio': 'Audio Library',
            'section_mushaf': 'E-Mushaf',
            'section_muhafiz': 'E-Muhafiz',
            'section_books': 'Religious Books',
            'section_dictionaries': 'Dictionaries',
            'section_prophets_stories': "Prophets' Stories",
            'section_seerah': 'Seerah',
            'section_ai_learning': 'AI Learning',

            // --- Footer ---
            'footer_rights': 'Sanaa Academy Platform. All rights reserved.',
            'footer_privacy': 'Privacy Policy',
            'footer_terms': 'Terms of Use',
            'footer_contact': 'Contact Us',

            // --- Index Page ---
            'title_index': 'Sanaa Academy Platform | Home',
            'hero_title_main': 'Sanaa Academy Platform',
            'hero_subtitle_platform': 'Your Gateway to Learning Islam, Arabic, and Quran',
            'subject_islamic': 'Islamic Studies',
            'subject_arabic': 'Arabic Language',
            'subject_quran': 'Holy Quran',
            'hero_cta': 'Discover Lectures Now',
            'about_section_title': 'What is Sana Platform?',
            'about_section_text': '"Sana" Platform is an educational initiative aimed at providing a deep and comprehensive understanding of Islamic religious sciences for non-Arabic speakers. We strive to simplify concepts and present them in a style that combines authenticity and modernity, focusing on the core values of Islam as a religion of mercy and wisdom.',
            'about_section_cta': 'Learn More About Us',
            'intro_video_title': 'Welcome to Sanaa Academy!',
            'getting_started_title': 'Getting Started & Our Sections',
            'getting_started_map_placeholder': '(Getting Started Map - Interactive design will be added here)',
            'featured_lectures_title': 'Featured Lectures',
            'lecture1_title': 'Introduction to Islamic Creed (Aqidah)',
            'lecture1_desc': 'A comprehensive overview of the pillars of faith and the most important basic concepts in Islamic creed.',
            'lecture2_title': 'Fundamentals of Jurisprudence (Fiqh - Worship)',
            'lecture2_desc': 'A simplified explanation of the rulings on purification, prayer, charity (Zakat), and fasting, and how to perform them correctly.',
            'lecture3_title_quran': 'Introduction to Quranic Sciences',
            'lecture3_desc_quran': 'Learn the basics of Tajweed and understand the fundamental meanings of Quranic verses.',
            'all_lectures_cta': 'View All Lectures',
            'testimonials_title': 'What Our Students Say',
            'gallery_title': 'Achievements & Certificates',
            'gallery_subtitle': 'Proud of our outstanding students and their certificates',
            'cta_section_title': 'Ready to Start Your Learning Journey?',
            'cta_section_subtitle': 'Join our live lectures via Zoom and interact with qualified instructors.',
            'cta_section_button': 'Check the Schedule',
            'intro_video_load_error': "(Failed to load intro video)",
            'intro_video_not_set': "(Intro video has not been uploaded yet)",
            'no_testimonials_found': "(No testimonials currently available)",
            'testimonial_load_error': "(Error loading testimonials)",
            'no_certificates_found': "(No certificates to display)",
            'certificate_load_error': "(Error loading certificates)",
            'price_plans_title': 'Pricing Plans & Offers',
            'no_price_plans_found': 'No pricing plans are currently available.',
            'price_free': 'Free',
            'billing_period_monthly': 'Monthly',
            'billing_period_yearly': 'Yearly',
            'billing_period_onetime': 'One-Time',
            'plan_basic_name': 'Basic Plan',
            'plan_basic_desc': 'A short description for the basic plan.',
            'plan_standard_name': 'Standard Plan',
            'plan_standard_desc': 'A short description for the standard plan.',
            'plan_premium_name': 'Premium Plan',
            'plan_premium_desc': 'A short description for the premium plan.',
            'feature_access_limited': 'Limited Content Access',
            'feature_community_access': 'Community Forum Access',
            'feature_access_all': 'Full Access to All Content',
            'feature_download_materials': 'Downloadable Materials',
            'feature_personal_support': 'Personalized Support',

            // --- About Page ---
            'title_about': 'About Sana | Sanaa Academy Platform',
            'about_page_title': 'Learn About Sana Platform',
            'about_page_subtitle': 'Our mission, vision, and values that guide our work towards authentic and accessible Islamic education.',
            'about_mission_title': 'Our Mission',
            'about_mission_text': 'To provide reliable and easy-to-understand Islamic educational content for non-Arabic speakers, using modern and interactive teaching methods, to promote the correct understanding of Islam and its tolerant values.',
            'about_vision_title': 'Our Vision',
            'about_vision_text': 'To be the leading global platform for teaching Islamic religious sciences to foreigners, building bridges of communication and cultural understanding between different cultures.',
            'about_values_title': 'Our Values',
            'about_values_list': '<li class="flex items-center justify-center md:justify-start"><svg class="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>Authenticity & Reliability</li><li class="flex items-center justify-center md:justify-start"><svg class="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>Moderation & Balance</li><li class="flex items-center justify-center md:justify-start"><svg class="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>Clarity & Simplification</li><li class="flex items-center justify-center md:justify-start"><svg class="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>Respect & Interaction</li><li class="flex items-center justify-center md:justify-start"><svg class="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>Excellence & Quality</li>',
            'about_instructors_title': 'Our Instructors',
            'instructor1_name': 'Instructor Name One',
            'instructor1_spec': 'Specialization (e.g., Fiqh & Aqidah)',
            'instructor1_bio': 'A brief overview of the instructor\'s experience and academic qualifications, focusing on their expertise in teaching foreigners.',
            'instructor2_name': 'Instructor Name Two',
            'instructor2_spec': 'Specialization (e.g., Seerah & Tafsir)',
            'instructor2_bio': 'A brief overview of the instructor\'s experience and academic qualifications, focusing on their expertise in teaching foreigners.',
            'instructor3_name': 'Instructor Name Three',
            'instructor3_spec': 'Specialization (e.g., Arabic Language & Quranic Sciences)',
            'instructor3_bio': 'A brief overview of the instructor\'s experience and academic qualifications, focusing on their expertise in teaching foreigners.',

            // --- Lectures Page ---
            'title_lectures': 'Lectures | Sanaa Academy Platform',
            'lectures_page_title': 'Our Lectures and Courses',
            'lectures_page_subtitle': 'Explore a variety of topics in Islamic religious sciences specifically designed for beginners.',
            'lecture_cat_aqidah': 'Creed',
            'lecture1_desc_long': 'A comprehensive overview of the pillars of faith (belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree). A simplified explanation of the most important basic concepts in Islamic creed and their significance.',
            'lecture_target_audience_title': 'Who is this course for?',
            'lecture1_target_audience': 'For beginners and those wishing to understand the foundations of Islam correctly.',
            'lecture_highlights_title': 'Content Highlights:',
            'lecture1_highlights': '<li>The concept of Tawhid (Oneness of God) and its categories.</li><li>The importance of belief in messengers and divine books.</li><li>An overview of the Last Day and its signs.</li>',
            'lecture_cat_fiqh': 'Jurisprudence',
            'lecture2_desc_long': 'A practical and simplified explanation of the rulings on purification (Wudu, Ghusl, Tayammum), prayer (its pillars, obligations, sunnahs), Zakat (its conditions, recipients), and fasting (its rulings and invalidators).',
            'lecture2_target_audience': 'For every Muslim who wants to learn how to perform basic acts of worship correctly.',
            'lecture2_highlights': '<li>Correct steps for Wudu (ablution).</li><li>How to perform prayer step-by-step.</li><li>The importance of Zakat and its conditions.</li>',
            'lecture_cat_seerah': 'Biography',
            'lecture3_title': 'Lessons from the Prophet\'s Biography (Seerah)',
            'lecture3_desc_long': 'A review of the most prominent milestones in the life of Prophet Muhammad ﷺ from his birth until his death, focusing on the educational, ethical, and moral lessons learned from his stances and life events.',
            'lecture3_target_audience': 'For those wishing to learn about the Prophet of Islam ﷺ and emulate his character and methodology.',
            'lecture3_highlights': '<li>The Prophet\'s ﷺ manners in dealing with people.</li><li>Examples of his patience and wisdom.</li><li>Building the Muslim community in Medina.</li>',
            'lecture_cat_tafsir': 'Exegesis',
            'lecture4_title': 'Introduction to Quranic Sciences and Tafsir',
            'lecture4_desc_long': 'An introduction to the sciences of the Holy Quran, how it was revealed and compiled, and the most important methodologies of commentators in understanding and reflecting on its verses. Practical application on the interpretation of some short Surahs.',
            'lecture4_target_audience': 'For those interested in understanding the Holy Quran and the principles of its interpretation.',
            'lecture4_highlights': '<li>The difference between Tafsir (exegesis) and Ta\'wil (interpretation).</li><li>Types of Tafsir (by narration, by opinion).</li><li>Interpretation of Surah Al-Fatihah.</li>',

            // --- Schedule Page ---
            'title_schedule': 'Schedule | Sanaa Academy Platform',
            'schedule_page_title': 'Lecture Schedule',
            'schedule_page_subtitle': 'Join us for our live lectures via Zoom',
            'schedule_timezone_note': '(All times are in Greenwich Mean Time - GMT)',
            'schedule_th_day': 'Day',
            'schedule_th_time': 'Time (GMT)',
            'schedule_th_lecture': 'Lecture',
            'schedule_th_join': 'Register / Join',
            'schedule_day_monday': 'Monday',
            'schedule_lecture_aqidah1': 'Introduction to Islamic Creed (Part 1)',
            'schedule_day_tuesday': 'Tuesday',
            'schedule_lecture_fiqh': 'Fundamentals of Fiqh: Purification & Prayer',
            'schedule_day_wednesday': 'Wednesday',
            'schedule_lecture_aqidah2': 'Introduction to Islamic Creed (Part 2)',
            'schedule_day_thursday': 'Thursday',
            'schedule_lecture_seerah': 'Lessons from the Prophet\'s Biography: Mecca',
            'schedule_day_friday': 'Friday',
            'schedule_no_lecture': 'No scheduled lecture',
            'schedule_day_saturday': 'Saturday',
            'schedule_lecture_tafsir': 'Introduction to Quranic Sciences & Tafsir',
            'schedule_day_sunday': 'Sunday',
            'schedule_notes_title': 'Important Notes:',
            'schedule_notes_list': '<li>Times may change, please check this page regularly.</li><li>Ensure you have downloaded and tested Zoom before the lecture time.</li><li>For inquiries about the schedule, please <a href="contact.html" class="text-emerald-600 hover:text-emerald-800 font-medium hover:underline">contact us</a>.</li><li>Recordings of past lectures will be added soon to the Lectures section.</li>',

            // --- Contact Page ---
            'title_contact': 'Contact Us | Sanaa Academy Platform',
            'contact_page_title': 'Contact Us',
            'contact_page_subtitle': 'We are happy to receive your inquiries and suggestions. We are here to help!',
            'contact_info_title': 'Contact Information',
            'contact_email_title': 'Email',
            'contact_email_desc': 'For general inquiries and technical support.',
            'contact_phone_title': 'Phone / WhatsApp (Optional)',
            'contact_phone_desc': 'For quick contact (please consider time differences).',
            'contact_address_title': 'Address (Optional)',
            'contact_address_text': 'Street Name, City, Country',
            'contact_address_desc': 'For postal correspondence (if necessary).',
            'contact_social_title': 'Follow us on:',
            'contact_form_title': 'Send Us a Message',
            'contact_form_name': 'Full Name',
            'contact_form_name_placeholder': 'Your full name',
            'contact_form_email': 'Email Address',
            'contact_form_email_placeholder': 'you@example.com',
            'contact_form_subject': 'Subject',
            'contact_form_subject_placeholder': 'Subject of your message',
            'contact_form_message': 'Message',
            'contact_form_message_placeholder': 'Write your message here...',
            'contact_form_submit': 'Send Message',
            'contact_form_note_formspree': "(This form is submitted via Formspree. You may need to confirm your email.)",
            'contact_form_success_en': 'Your message has been sent successfully!',
            'contact_form_error_en': 'An error occurred. Please try again.',


            // --- Login Page ---
            'login_title': 'Login to Your Account',
            'login_subtitle': 'Or',
            'login_create_account_link': 'create a new account',
            'login_email_label': 'Email address',
            'login_password_label': 'Password',
            'login_forgot_password_link': 'Forgot your password?',
            'login_button': 'Login',
            'login_or_continue_with': 'Or continue with',

            // --- Signup Page ---
            'signup_title': 'Create a New Account',
            'signup_subtitle': 'Or',
            'signup_login_link': 'login if you already have an account',
            'signup_section_basic': 'Basic Information',
            'signup_fullname_label': 'Full Name',
            'signup_email_label': 'Email Address',
            'signup_password_label': 'Password',
            'signup_password_confirm_label': 'Confirm Password',
            'signup_age_label': 'Age',
            'signup_gender_label': 'Gender',
            'signup_gender_select': '-- Select --',
            'signup_gender_male': 'Male',
            'signup_gender_female': 'Female',
            'signup_gender_other': 'Other',
            'signup_gender_prefer_not': 'Prefer not to say',
            'signup_section_knowledge': 'Religious Knowledge Level',
            'signup_knowledge_islam_label': 'Your general knowledge of Islam?',
            'signup_level_select': '-- Select Level --',
            'signup_level_beginner': 'Beginner / Know nothing',
            'signup_level_intermediate': 'Intermediate / Have some information',
            'signup_level_advanced': 'Advanced / Have good knowledge',
            'signup_knowledge_quran_label': 'Your knowledge of the Holy Quran?',
            'signup_quran_select': '-- Select Level --',
            'signup_quran_none': "Don't know how to read",
            'signup_quran_basic': 'Can read slowly',
            'signup_quran_fluent': 'Read fluently',
            'signup_quran_tajweed': 'Know some Tajweed rules',
            'signup_quran_memorization': 'Memorized some Surahs',
            'signup_knowledge_new_muslim_label': 'Are you new to Islam?',
            'signup_section_goals': 'Goals and Platform Discovery',
            'signup_aspirations_label': 'What are your aspirations or what do you hope to learn?',
            'signup_how_heard_label': 'How did you hear about Sana Platform?',
            'signup_how_heard_select': '-- Select --',
            'signup_how_heard_friend': 'Through a friend',
            'signup_how_heard_social': 'Social Media (Facebook, Twitter, ..)',
            'signup_how_heard_search': 'Search Engine (Google, ..)',
            'signup_how_heard_website': 'Another website / Blog',
            'signup_how_heard_other': 'Other (Please specify in aspirations)',
            'signup_button': 'Create Account',
            'signup_or_continue_with': 'Or sign up with',

            // --- Profile Page ---
            'profile_name_placeholder': 'Full Student Name',
            'profile_email_placeholder': 'student.email@example.com',
            'profile_edit_button': 'Edit Profile',
            'profile_section_details': 'Account Details',
            'profile_label_fullname': 'Full Name:',
            'profile_label_email': 'Email:',
            'profile_label_phone': 'Phone Number:',
            'profile_label_whatsapp': 'WhatsApp:',
            'profile_label_age': 'Age:',
            'profile_label_gender': 'Gender:',
            'profile_section_courses': 'Enrolled Courses',
            'profile_no_courses': 'You are not enrolled in any courses yet.',
            'profile_section_links': 'Lecture Links',
            'profile_no_links': 'No links available at the moment.',
            'edit_profile_title': 'Edit Profile',
            'edit_profile_avatar_label': 'Change Profile Picture (Optional):',
            'edit_profile_avatar_note': 'Max size: 2MB. Allowed formats: JPG, PNG, GIF.',
            'edit_profile_fullname_label': 'Full Name:',
            'edit_profile_phone_label': 'Phone Number (Optional):',
            'edit_profile_whatsapp_label': 'WhatsApp Number (Optional):',
            'edit_profile_cancel_button': 'Cancel',
            'edit_profile_save_button': 'Save Changes',

            // --- Teacher Dashboard ---
            'teacher_dashboard_title': 'Teacher Dashboard',
            'teacher_assigned_students': 'Assigned Students:',
            'teacher_no_students': 'No students are currently assigned to this course.',
            'teacher_send_link_title': 'Send Link to Students',
            'teacher_select_course': 'Select Course:',
            'teacher_select_course_placeholder': '-- Select Course --',
            'teacher_link_url': 'Lecture/Material Link:',
            'teacher_link_description': 'Link Description (Optional):',
            'teacher_send_button': 'Send Link to Students',
            'teacher_link_sent_success': 'Link sent successfully!',
            'teacher_link_sent_error': 'Error sending link. Please try again.',

            // --- Admin Dashboard ---
            'admin_dashboard_title': 'Admin Dashboard',
            'admin_manage_users_title': 'Manage Users',
            'admin_add_user_button': 'Add User',
            'admin_table_header_name': 'Name',
            'admin_table_header_email': 'Email',
            'admin_table_header_role': 'Role',
            'admin_table_header_actions': 'Actions',
            'admin_action_edit': 'Edit',
            'admin_action_delete': 'Delete',
            'admin_manage_courses_title': 'Manage Courses',
            'admin_add_course_button': 'Add Course',
            'admin_table_header_course_name': 'Course Name',
            'admin_table_header_instructor': 'Assigned Instructor',
            'admin_table_header_students_enrolled': '# Students',
            'admin_action_assign_users': 'Assign',
            'admin_assign_users_title': 'Assign Users to Courses',
            'admin_assign_select_course': 'Select Course:',
            'admin_assign_select_user': 'Select User:',
            'admin_assign_button': 'Assign',
            'admin_assign_note': 'Note: Assigning a teacher sets them as the course instructor. Assigning a student adds them to the course roster.',
            'admin_delete_confirm': 'Are you sure you want to delete user %USER%?',
            'admin_delete_course_confirm': 'Are you sure you want to delete course %COURSE%? This will also unenroll students.',
            'admin_modal_add_user_title': 'Add New User',
            'admin_modal_edit_user_title': 'Edit User Information',
            'admin_modal_password_note_add': 'Required for new user.',
            'admin_modal_password_placeholder_edit': 'Leave blank to keep current password',
            'admin_modal_password_note_edit': 'Only enter a new password if you want to change it.',
            'admin_modal_save_button': 'Save',
            'admin_modal_add_course_title': 'Add New Course',
            'admin_modal_edit_course_title': 'Edit Course Information',
            'admin_modal_course_title_key': 'Course Title Key:',
            'admin_modal_translation_key_note': 'Used for translation in script.js.',
            'admin_modal_course_desc_key': 'Course Description Key:',
            'admin_modal_course_cat_key': 'Course Category Key:',
            'admin_modal_course_image_url': 'Course Image URL (Optional):',
            'admin_modal_course_instructor': 'Assigned Instructor (Optional):',
            'admin_modal_select_instructor': '-- Select Instructor --',
            'admin_manage_sections_title': 'Manage Platform Sections',
            'admin_add_section_button': 'Add Section',
            'admin_section_header_name': 'Section Name (Key)',
            'admin_section_header_icon': 'Icon Class',
            'admin_section_header_path': 'Path',
            'admin_section_header_order': 'Order',
            'admin_section_header_active': 'Active',
            'admin_modal_add_section_title': 'Add New Section',
            'admin_modal_edit_section_title': 'Edit Section Details',
            'admin_section_icon_note': 'CSS class for the icon (e.g., Font Awesome).',
            'admin_section_path_note': 'URL path (lowercase, no spaces).',
            'admin_no_users_message': "No users to display.",
            'admin_no_courses_message': "No courses to display.",
            'admin_no_sections_message': "No sections to display.",
            'admin_manage_price_plans_title': "Manage Price Plans",
            'admin_add_price_plan_button': "Add Price Plan",
            'admin_price_plan_header_name': "Plan Name (Key)",
            'admin_price_plan_header_price': "Price",
            'admin_price_plan_header_currency': "Currency",
            'admin_price_plan_header_billing': "Billing Period",
            'admin_price_plan_header_active': "Active",
            'admin_price_plan_header_featured': "Featured",
            'admin_no_price_plans_message': "No price plans to display.",
            'admin_modal_add_price_plan_title': "Add New Price Plan",
            'admin_modal_edit_price_plan_title': "Edit Price Plan",
            'admin_price_plan_label_name_key': "Plan Name Key:",
            'admin_price_plan_label_desc_key': "Plan Description Key (Optional):",
            'admin_price_plan_label_price': "Price:",
            'admin_price_plan_label_currency': "Currency:",
            'admin_price_plan_label_billing': "Billing Period:",
            'admin_price_plan_label_features': "Feature Keys (comma-separated):",
            'admin_price_plan_label_course_id': "Course ID (Optional):",
            'admin_price_plan_label_order': "Display Order:",
            'admin_price_plan_label_active': "Active:",
            'admin_price_plan_label_featured': "Featured:",
            'admin_modal_cancel_button': "Cancel",
            'admin_manage_intro_video_title': "Manage Intro Video",
            'admin_intro_video_label': "Upload New Video (MP4, WebM, Ogg):",
            'admin_intro_video_note': "The new video will replace the current one.",
            'admin_intro_video_current': "Current Video:",
            'admin_intro_video_none': "No current video.",
            'admin_intro_video_upload_button': "Upload & Update Video",
            'admin_manage_podcasts_title': "Manage Podcasts",
            'admin_add_podcast_button': "Add Podcast",
            'admin_podcast_header_title': "Title",
            'admin_podcast_header_thumbnail': "Thumbnail",
            'admin_podcast_header_duration': "Duration",
            'admin_podcast_header_published': "Published Date",
            'admin_no_podcasts_message': "No podcasts to display.",
            'admin_podcast_label_title': "Podcast Title:",
            'admin_podcast_label_desc': "Description (Optional):",
            'admin_podcast_label_duration': "Duration (seconds, optional):",
            'admin_podcast_label_published': "Published Date (Optional):",
            'admin_podcast_label_audio': "Audio File (MP3, WAV, OGG):",
            'admin_podcast_label_thumbnail': "Thumbnail Image (Optional):",
            'admin_manage_books_title': "Manage Books",
            'admin_add_book_button': "Add Book",
            'admin_book_header_cover': "Cover",
            'admin_book_header_title': "Title",
            'admin_book_header_author': "Author",
            'admin_book_header_category': "Category",
            'admin_book_header_file': "File",
            'admin_no_books_message': "No books to display.",
            'admin_book_label_title': "Book Title:",
            'admin_book_label_author': "Author (Optional):",
            'admin_book_label_category': "Category (Optional):",
            'admin_book_label_desc': "Description (Optional):",
            'admin_book_label_year': "Published Year (Optional):",
            'admin_book_label_cover': "Cover Image (Optional):",
            'admin_book_label_file': "Book File (PDF, EPUB - Optional):",
            'admin_manage_audio_title': "Manage Audio Files",
            'admin_add_audio_button': "Add Audio File",
            'admin_audio_header_title': "Title",
            'admin_audio_header_speaker': "Speaker",
            'admin_audio_header_category': "Category",
            'admin_audio_header_duration': "Duration",
            'admin_no_audio_message': "No audio files to display.",
            'admin_audio_label_title': "Audio File Title:",
            'admin_audio_label_speaker': "Speaker Name (Optional):",
            'admin_audio_label_category': "Category (Optional):",
            'admin_audio_label_desc': "Description (Optional):",
            'admin_audio_label_duration': "Duration (seconds, optional):",
            'admin_audio_label_file': "Audio File (MP3, WAV, OGG):",
            'admin_manage_stories_title': "Manage Stories & Seerah",
            'admin_add_story_button': "Add Story/Seerah",
            'admin_story_header_title': "Title",
            'admin_story_header_category': "Category",
            'admin_story_header_image': "Image",
            'admin_no_stories_message': "No stories or seerah to display.",
            'admin_story_label_title': "Title:",
            'admin_story_label_category': "Category:",
            'admin_story_category_prophets': "Prophets' Stories",
            'admin_story_category_seerah': "Seerah",
            'admin_story_category_other': "Other",
            'admin_story_label_content': "Content:",
            'admin_story_label_image': "Image (Optional):",
            'admin_manage_dictionary_title': "Manage Dictionary",
            'admin_add_dictionary_entry_button': "Add Entry",
            'admin_dictionary_header_term': "Term",
            'admin_dictionary_header_definition': "Definition (Excerpt)",
            'admin_dictionary_header_root': "Root",
            'admin_no_dictionary_entries_message': "No dictionary entries to display.",
            'admin_dictionary_label_term': "Term:",
            'admin_dictionary_label_definition': "Definition:",
            'admin_dictionary_label_root': "Root (Optional):",
            'admin_dictionary_label_example': "Example (Optional):",
            'admin_manage_testimonials_title': "Manage Testimonials",
            'admin_add_testimonial_button': "Add Testimonial",
            'admin_testimonial_header_avatar': "Avatar",
            'admin_testimonial_header_name': "Student Name",
            'admin_testimonial_header_text': "Testimonial Text (Excerpt)",
            'admin_testimonial_header_approved': "Approved",
            'admin_no_testimonials_message': "No testimonials to display.",
            'admin_testimonial_label_name': "Student Name:",
            'admin_testimonial_label_text': "Testimonial Text:",
            'admin_testimonial_label_detail': "Student Detail (Optional):",
            'admin_testimonial_label_avatar': "Student Avatar (Optional):",
            'admin_testimonial_label_approved': "Approved for Public Display:",
            'admin_manage_certificates_title': "Manage Certificates",
            'admin_add_certificate_button': "Add Certificate",
            'admin_certificate_header_image': "Certificate Image",
            'admin_certificate_header_student': "Student Name",
            'admin_certificate_header_course': "Course",
            'admin_certificate_header_date': "Issue Date",
            'admin_no_certificates_message': "No certificates to display.",
            'admin_certificate_label_student': "Student Name:",
            'admin_certificate_label_course': "Course Name (Optional):",
            'admin_certificate_label_date': "Issue Date (Optional):",
            'admin_certificate_label_image': "Certificate Image (Required):",
            'admin_delete_user_success': 'User deleted successfully.',
            'admin_delete_user_fail': 'Failed to delete user.',
            'admin_delete_course_success': 'Course deleted successfully.',
            'admin_delete_course_fail': 'Failed to delete course.',
            'admin_delete_section_confirm': 'Are you sure you want to delete section %ENTITY%?',
            'admin_delete_section_success': 'Section deleted successfully.',
            'admin_delete_section_fail': 'Failed to delete section.',
            'admin_delete_price_plan_confirm': "Are you sure you want to delete price plan '%ENTITY%'?",
            'admin_delete_price_plan_success': 'Price plan deleted successfully.',
            'admin_delete_price_plan_fail': 'Failed to delete price plan.',
            'admin_delete_podcast_confirm': "Are you sure you want to delete podcast '%ENTITY%'?",
            'admin_delete_podcast_success': 'Podcast deleted successfully.',
            'admin_delete_podcast_fail': 'Failed to delete podcast.',
            'admin_delete_book_confirm': "Are you sure you want to delete book '%ENTITY%'?",
            'admin_delete_book_success': 'Book deleted successfully.',
            'admin_delete_book_fail': 'Failed to delete book.',
            'admin_delete_audio_confirm': "Are you sure you want to delete audio file '%ENTITY%'?",
            'admin_delete_audio_success': 'Audio file deleted successfully.',
            'admin_delete_audio_fail': 'Failed to delete audio file.',
            'admin_delete_story_confirm': "Are you sure you want to delete story/seerah '%ENTITY%'?",
            'admin_delete_story_success': 'Story/Seerah deleted successfully.',
            'admin_delete_story_fail': 'Failed to delete story/seerah.',
            'admin_delete_dictionary_confirm': "Are you sure you want to delete dictionary entry for '%ENTITY%'?",
            'admin_delete_dictionary_success': 'Dictionary entry deleted successfully.',
            'admin_delete_dictionary_fail': 'Failed to delete dictionary entry.',
            'admin_delete_testimonial_confirm': "Are you sure you want to delete testimonial from '%ENTITY%'?",
            'admin_delete_testimonial_success': 'Testimonial deleted successfully.',
            'admin_delete_testimonial_fail': 'Failed to delete testimonial.',
            'admin_delete_certificate_confirm': "Are you sure you want to delete certificate for '%ENTITY%'?",
            'admin_delete_certificate_success': 'Certificate deleted successfully.',
            'admin_delete_certificate_fail': 'Failed to delete certificate.',
        }
    },

    // --- State ---
    currentLanguage: 'ar',
    intersectionObserver: null,
    API_BASE_URL: 'https://snaa.onrender.com/api',
    UPLOADS_BASE_URL: 'http://localhost:5000/uploads/', // Added for consistency

    // --- Core Functions ---
    updateTexts: function(lang) {
        const elements = document.querySelectorAll('[data-translate-key]');
        elements.forEach(el => {
            const key = el.getAttribute('data-translate-key');
            if (this.translations[lang] && this.translations[lang][key]) {
                const translation = this.translations[lang][key];
                if (el.tagName === 'META' && el.name === 'description') { el.content = translation; }
                else if (el.tagName === 'TITLE') { el.textContent = translation; }
                else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    const placeholderKey = key + '_placeholder';
                    if (this.translations[lang][placeholderKey]) { el.placeholder = this.translations[lang][placeholderKey];}
                    else if (el.type !== 'file' && el.type !== 'checkbox' && el.type !== 'radio' && el.dataset.translateValue !== 'false') { el.value = translation; }
                    else { el.textContent = translation; }
                }
                else if (el.tagName === 'OPTION' && el.value === "") { el.textContent = translation; }
                else if (key.endsWith('_list') || key.endsWith('_highlights') || key.startsWith('schedule_notes_list')) { el.innerHTML = translation; }
                else { el.textContent = translation; }
            }
        });
        this.updateHtmlAttributes(lang);
        this.updateAlignment(lang);
        this.updateListStyles(lang);
        this.highlightActiveNavLink(this.getCurrentPageFilename());
    },

    updateHtmlAttributes: function(lang) {
        const htmlEl = document.documentElement;
        htmlEl.lang = lang;
        htmlEl.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    },

    updateAlignment: function(lang) {
        const isRTL = lang === 'ar';
        document.querySelectorAll('select.form-input').forEach(select => {
             select.style.backgroundPosition = isRTL ? 'left 0.5rem center' : 'right 0.5rem center';
             select.style.paddingLeft = isRTL ? '2.5rem' : '0.75rem';
             select.style.paddingRight = isRTL ? '0.75rem' : '2.5rem';
         });
        document.querySelectorAll('.list-icon-margin').forEach(icon => {
              icon.classList.remove('ml-2', 'mr-2');
              icon.classList.add(isRTL ? 'ml-2' : 'mr-2');
          });
        document.querySelectorAll('.data-table th, .data-table td').forEach(cell => {
               cell.style.textAlign = isRTL ? 'right' : 'left';
          });
    },

    updateListStyles: function(lang) {
        const isRTL = lang === 'ar';
        const valuesList = document.querySelector('[data-translate-key="about_values_list"]');
        if (valuesList) {
            const listItems = valuesList.querySelectorAll('li');
            listItems.forEach(li => {
                const icon = li.querySelector('svg');
                if (icon) {
                    icon.classList.remove('ml-2', 'mr-2');
                    icon.classList.add(isRTL ? 'ml-2' : 'mr-2');
                }
            });
        }
    },

    changeLanguage: function(lang) {
        if (this.translations[lang] && lang !== this.currentLanguage) {
            this.currentLanguage = lang;
            localStorage.setItem('preferredLang', lang);
            this.updateHtmlAttributes(lang);
            this.updateHeaderUI();
            this.updateTexts(lang);
            const langButtons = document.querySelectorAll('.lang-btn');
            langButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === lang);
            });
            if (this.getCurrentPageFilename() === 'index.html' && typeof this.loadPricePlans === 'function') {
                this.loadPricePlans();
            }
        }
    },

    getCurrentLanguage: function() {
        return localStorage.getItem('preferredLang') || 'ar';
    },

    getCurrentPageFilename: function() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1);
        return filename === '' ? 'index.html' : filename;
    },

    initializeScrollAnimation: function() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.scroll-animate-item').forEach(item => {
                item.classList.remove('is-visible');
                this.intersectionObserver.observe(item);
            });
        } else {
            document.querySelectorAll('.scroll-animate-item').forEach(item => item.classList.add('is-visible'));
        }
    },

    setupStickyHeader: function() {
        const header = document.getElementById('main-header');
        if (!header) return;
        const scrollThreshold = 50;
        const handleScroll = () => {
            header.classList.toggle('header-scrolled', window.scrollY > scrollThreshold);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    },

    setupMobileMenu: function() {
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const header = document.getElementById('main-header');
        if (!menuToggle || !mobileMenu || !header) return;

        menuToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isExpanded = mobileMenu.classList.toggle('hidden');
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        });
        document.addEventListener('click', (event) => {
            if (!mobileMenu.classList.contains('hidden') && !header.contains(event.target)) {
                mobileMenu.classList.add('hidden');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
        mobileMenu.addEventListener('click', (event) => {
            if (event.target.tagName === 'A' && event.target.getAttribute('href') !== '#') {
                 mobileMenu.classList.add('hidden');
                 menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    },

    updateFooterYear: function() {
        const currentYearSpan = document.getElementById('currentYear');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    },

    handleLogout: function() {
        console.log('Logging out user...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        window.location.href = 'login.html';
    },

    updateHeaderUI: function() {
        const desktopNavLinks = document.getElementById('desktopNavLinks');
        const desktopAuthArea = document.getElementById('desktopAuthArea');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileAuthArea = document.getElementById('mobileAuthArea');

        if (!desktopNavLinks || !desktopAuthArea || !mobileMenu || !mobileAuthArea) {
            console.error("Header elements not found for UI update.");
            return;
        }

        desktopAuthArea.innerHTML = '';
        mobileAuthArea.innerHTML = '';
        desktopNavLinks.innerHTML = '';
        Array.from(mobileMenu.children).forEach(child => { if (child !== mobileAuthArea) child.remove(); });

        const token = localStorage.getItem('authToken');
        let userInfo = null;
        try { userInfo = JSON.parse(localStorage.getItem('userInfo')); } catch (e) { /* ignore */ }

        const currentLang = this.getCurrentLanguage();
        const baseNavLinks = [
            { href: 'index.html', key: 'nav_home' },
            { href: 'about.html', key: 'nav_about' },
            { href: '#sections', key: 'nav_sections', id: 'sectionsDropdownToggle' },
            { href: 'schedule.html', key: 'nav_schedule' },
            { href: 'contact.html', key: 'nav_contact' },
        ];
        const loggedInNavLinks = [];
        if (token && userInfo) {
            loggedInNavLinks.push({ href: 'profile.html', key: 'nav_profile', dynamic: true });
            if (userInfo.role === 'admin') {
                loggedInNavLinks.push({ href: 'admin-dashboard.html', key: 'nav_admin_dashboard', dynamic: true });
            } else if (userInfo.role === 'teacher') {
                loggedInNavLinks.push({ href: 'teacher-dashboard.html', key: 'nav_dashboard', dynamic: true });
            }
        }
        const allLinks = [...baseNavLinks, ...loggedInNavLinks];

        const createNavLink = (linkInfo, isMobile = false) => {
            const link = document.createElement('a');
            link.href = linkInfo.href;
            link.dataset.translateKey = linkInfo.key;
            link.textContent = this.translations[currentLang][linkInfo.key] || linkInfo.key;
            if (linkInfo.id) link.id = linkInfo.id;
            link.className = isMobile ? 'nav-link block px-3 py-2 rounded-md text-base font-medium' : 'nav-link px-3 py-2 font-medium';
            if (linkInfo.dynamic) link.dataset.dynamicNav = 'true';
            return link;
        };

        allLinks.forEach(linkInfo => desktopNavLinks.appendChild(createNavLink(linkInfo, false)));
        allLinks.forEach(linkInfo => mobileMenu.insertBefore(createNavLink(linkInfo, true), mobileAuthArea));

        if (token && userInfo) {
            const logoutButtonDesktop = document.createElement('a');
            logoutButtonDesktop.href = '#logout';
            logoutButtonDesktop.className = 'auth-button auth-button-logout';
            logoutButtonDesktop.dataset.translateKey = 'nav_logout';
            logoutButtonDesktop.textContent = this.translations[currentLang].nav_logout || 'Logout';
            logoutButtonDesktop.onclick = (e) => { e.preventDefault(); this.handleLogout(); };
            desktopAuthArea.appendChild(logoutButtonDesktop);

            const logoutButtonMobile = document.createElement('a');
            logoutButtonMobile.href = '#logout';
            logoutButtonMobile.className = 'auth-button auth-button-logout';
            logoutButtonMobile.dataset.translateKey = 'nav_logout';
            logoutButtonMobile.textContent = this.translations[currentLang].nav_logout || 'Logout';
            logoutButtonMobile.onclick = (e) => { e.preventDefault(); this.handleLogout(); };
            mobileAuthArea.appendChild(logoutButtonMobile);
        } else {
            const loginButtonDesktop = createNavLink({ href: 'login.html', key: 'nav_login' }, false);
            loginButtonDesktop.classList.add('auth-button', 'auth-button-login');
            desktopAuthArea.appendChild(loginButtonDesktop);
            const signupButtonDesktop = createNavLink({ href: 'signup.html', key: 'nav_signup' }, false);
            signupButtonDesktop.classList.add('auth-button', 'auth-button-signup');
            desktopAuthArea.appendChild(signupButtonDesktop);

            const loginButtonMobile = createNavLink({ href: 'login.html', key: 'nav_login' }, true);
            loginButtonMobile.classList.add('auth-button', 'auth-button-login');
            mobileAuthArea.appendChild(loginButtonMobile);
            const signupButtonMobile = createNavLink({ href: 'signup.html', key: 'nav_signup' }, true);
            signupButtonMobile.classList.add('auth-button', 'auth-button-signup');
            mobileAuthArea.appendChild(signupButtonMobile);
        }
        this.setupSectionsDropdown();
        this.updateTexts(currentLang);
    },

    highlightActiveNavLink: function(currentPageFilename) {
        const navLinks = document.querySelectorAll('#desktopNavLinks a.nav-link, #mobile-menu a.nav-link');
        const normalizedCurrentPage = currentPageFilename.split('?')[0].split('#')[0];

        navLinks.forEach(link => {
            let linkPath = '';
            try {
                const linkUrl = new URL(link.href, window.location.origin);
                linkPath = linkUrl.pathname.substring(linkUrl.pathname.lastIndexOf('/') + 1) || 'index.html';
                linkPath = linkPath.split('?')[0].split('#')[0];
                if (linkUrl.hash && linkPath === normalizedCurrentPage && link.id !== 'sectionsDropdownToggle') {
                    link.classList.remove('active-nav-link'); return;
                }
            } catch (e) {
                linkPath = (link.getAttribute('href') || '').split('#')[0].split('?')[0];
                if (linkPath === '' || (link.getAttribute('href') || '').startsWith('#') && link.id !== 'sectionsDropdownToggle') {
                     link.classList.remove('active-nav-link'); return;
                }
                linkPath = linkPath === '' ? 'index.html' : linkPath;
            }
            link.classList.remove('active-nav-link');
            if (linkPath === normalizedCurrentPage && !(link.getAttribute('href') || '').startsWith('#')) {
                link.classList.add('active-nav-link');
            }
        });
    },

    createPricePlanCardHtml: function(planData) {
        const currentLang = this.getCurrentLanguage();
        const translations = this.translations[currentLang];
        const planNameKey = planData.name_key || `plan_unknown_${planData.plan_id}_name`;
        const planName = translations[planNameKey] || planNameKey.replace('plan_', '').replace('_name', '').replace(/_/g, ' ');
        const planDescriptionKey = planData.description_key || `plan_unknown_${planData.plan_id}_desc`;
        const planDescription = translations[planDescriptionKey] || '';
        const priceValue = parseFloat(planData.price);
        const priceText = !isNaN(priceValue) && priceValue > 0
            ? `${priceValue.toFixed(2)} <span class="currency">${planData.currency || 'USD'}</span>`
            : (translations.price_free || 'Free');
        const billingPeriodKey = `billing_period_${planData.billing_period || 'onetime'}`;
        const billingPeriodText = translations[billingPeriodKey] || planData.billing_period || '';
        let featuresHtml = '';
        if (planData.features_keys && Array.isArray(planData.features_keys)) {
            featuresHtml = planData.features_keys.map(key => {
                const featureText = translations[key] || key.replace('feature_', '').replace(/_/g, ' ');
                return `<li class="flex items-center justify-center">
                          <svg class="w-4 h-4 text-emerald-500 ${currentLang === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                          <span>${featureText}</span>
                        </li>`;
            }).join('');
        }
        return `
            <div class="price-plan-card ${planData.is_featured ? 'featured' : ''} scroll-animate-item scroll-animate-from-bottom" style="animation-delay: ${planData.display_order * 100}ms;">
                <h3 class="plan-name">${planName}</h3>
                ${planDescription ? `<p class="text-sm text-gray-500 mb-4">${planDescription}</p>` : ''}
                <div class="plan-price">${priceText} ${billingPeriodText ? `/ <span data-translate-key="${billingPeriodKey}">${billingPeriodText}</span>` : ''}</div>
                <ul class="plan-features">
                    ${featuresHtml}
                </ul>
                <button class="cta-button cta-button-primary w-full select-plan-button" data-plan-id="${planData.plan_id}" data-plan-name="${planName}" data-price="${planData.price}" data-currency="${planData.currency}" data-course-id="${planData.course_id || ''}" data-translate-key="select_plan">
                    ${translations.select_plan || 'Select Plan'}
                </button>
            </div>
        `;
    },

    loadPricePlans: async function() {
        const pricePlanGrid = document.getElementById('pricePlanGrid');
        const pricePlanLoading = document.getElementById('pricePlanLoading');
        const noPricePlansMessage = document.getElementById('noPricePlansMessage');

        if (!pricePlanGrid || !pricePlanLoading || !noPricePlansMessage) {
            console.warn("Price plan DOM elements not found. Skipping price plan loading.");
            return;
        }
        pricePlanLoading.classList.remove('hidden');
        pricePlanGrid.innerHTML = '';
        noPricePlansMessage.classList.add('hidden');

        try {
            const response = await fetch(`${this.API_BASE_URL}/price-plans`);
            if (!response.ok) {
                let errorData; try { errorData = await response.json(); } catch (e) { errorData = { message: response.statusText }; }
                throw new Error(errorData.message || `Failed to fetch price plans: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.plans && data.plans.length > 0) {
                data.plans.forEach(plan => {
                    pricePlanGrid.innerHTML += this.createPricePlanCardHtml(plan);
                });
                this.initializeScrollAnimation();
                this.updateTexts(this.getCurrentLanguage());
                document.querySelectorAll('.select-plan-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const planDetails = { planId: this.dataset.planId, planName: this.dataset.planName, price: this.dataset.price, currency: this.dataset.currency, courseId: this.dataset.courseId };
                        localStorage.setItem('selectedPlan', JSON.stringify(planDetails));
                        window.location.href = 'payment.html';
                    });
                });
            } else {
                noPricePlansMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Error loading price plans:", error);
            noPricePlansMessage.textContent = this.translations[this.getCurrentLanguage()].error_loading_data || 'Error loading plans.';
            noPricePlansMessage.classList.remove('hidden');
            noPricePlansMessage.classList.add('text-red-600');
        } finally {
            pricePlanLoading.classList.add('hidden');
        }
    },

    setupSectionsDropdown: async function() {
        const sectionsDropdownToggle = document.getElementById('sectionsDropdownToggle');
        if (!sectionsDropdownToggle) return;

        let sectionsDropdownMenu = document.getElementById('sectionsDropdownMenu');
        if (!sectionsDropdownMenu) {
            sectionsDropdownMenu = document.createElement('div');
            sectionsDropdownMenu.id = 'sectionsDropdownMenu';
            sectionsDropdownMenu.className = 'absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 hidden';
            sectionsDropdownToggle.parentNode.style.position = 'relative';
            sectionsDropdownToggle.parentNode.appendChild(sectionsDropdownMenu);
        }
        sectionsDropdownMenu.innerHTML = `<div class="px-4 py-2 text-sm text-gray-500" data-translate-key="loading">${this.translations[this.getCurrentLanguage()].loading || 'Loading...'}</div>`;

        sectionsDropdownToggle.addEventListener('click', (event) => {
            event.preventDefault();
            sectionsDropdownMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (event) => {
            if (!sectionsDropdownToggle.contains(event.target) && !sectionsDropdownMenu.contains(event.target)) {
                sectionsDropdownMenu.classList.add('hidden');
            }
        });

        try {
            const response = await fetch(`${this.API_BASE_URL}/sections`); // Public endpoint for sections
            if (!response.ok) throw new Error('Failed to fetch sections');
            const data = await response.json();
            sectionsDropdownMenu.innerHTML = '';

            if (data && data.sections && data.sections.length > 0) {
                const activeSections = data.sections.filter(s => s.is_active).sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
                activeSections.forEach(section => {
                    const sectionName = this.translations[this.getCurrentLanguage()][section.name_key] || section.name_key.replace('section_', '').replace(/_/g, ' ');
                    const link = document.createElement('a');
                    link.href = `${section.path}.html`;
                    link.className = 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900';
                    link.dataset.translateKey = section.name_key;
                    link.textContent = sectionName;
                    if (section.name_key === 'section_ai_learning') {
                        link.classList.add('opacity-50', 'cursor-not-allowed');
                        link.href = '#';
                        link.onclick = (e) => e.preventDefault();
                        const soonSpan = document.createElement('span');
                        soonSpan.className = 'text-xs text-gray-400 ml-2';
                        soonSpan.dataset.translateKey = 'coming_soon';
                        soonSpan.textContent = this.translations[this.getCurrentLanguage()].coming_soon || '(Coming Soon)';
                        link.appendChild(soonSpan);
                    }
                    sectionsDropdownMenu.appendChild(link);
                });
            } else {
                sectionsDropdownMenu.innerHTML = `<div class="px-4 py-2 text-sm text-gray-500" data-translate-key="no_sections_available">${this.translations[this.getCurrentLanguage()].no_sections_available || 'No sections.'}</div>`;
            }
        } catch (error) {
            console.error("Error loading sections for dropdown:", error);
            sectionsDropdownMenu.innerHTML = `<div class="px-4 py-2 text-sm text-red-500" data-translate-key="error_loading_data">${this.translations[this.getCurrentLanguage()].error_loading_data || 'Error.'}</div>`;
        }
        this.updateTexts(this.getCurrentLanguage());
    },


    initPage: function(currentPageFilename) {
        console.log(`Sana App: Initializing page - ${currentPageFilename}`);
        this.currentLanguage = this.getCurrentLanguage();

        this.updateHtmlAttributes(this.currentLanguage);
        this.updateHeaderUI();
        this.updateFooterYear();
        this.setupMobileMenu();
        this.setupStickyHeader();
        this.initializeScrollAnimation();

        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            if (!btn.dataset.lang) btn.dataset.lang = btn.classList.contains('ar') ? 'ar' : 'en';
            btn.addEventListener('click', () => this.changeLanguage(btn.dataset.lang));
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });

        if (currentPageFilename === 'index.html') {
            if (typeof this.loadPricePlans === 'function') {
                this.loadPricePlans();
            } else {
                console.error("loadPricePlans function is not defined on sanaApp.");
            }
            // The inline script in index.html will call other specific functions like loadIntroVideo, loadTestimonials etc.
        }
        console.log(`Sana App: Initialization complete for ${currentPageFilename} with language: ${this.currentLanguage}`);
    }
};
