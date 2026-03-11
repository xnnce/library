// قائمة التصنيفات العامة
const subjects = [
    { id: "all", name: "الكل", icon: "fa-solid fa-layer-group" },
    { id: "stories", name: "قصص", icon: "fa-solid fa-book" },
    { id: "novels", name: "روايات", icon: "fa-solid fa-book-open" },
    { id: "religious", name: "دينية", icon: "fa-solid fa-mosque" },
    { id: "science", name: "علمية", icon: "fa-solid fa-flask" },
    { id: "history", name: "تاريخية", icon: "fa-solid fa-landmark" },
    { id: "self-dev", name: "تنمية بشرية", icon: "fa-solid fa-brain" }
];

// بيانات الكتب الافتراضية
const defaultBooks = [
    {
        title: "الأيام",
        author: "طه حسين",
        subject: "stories",
        image: "https://via.placeholder.com/200x300?text=الأيام",
        pdf: "#"
    },
    {
        title: "مئة عام من العزلة",
        author: "غابرييل غارسيا ماركيز",
        subject: "novels",
        image: "https://via.placeholder.com/200x300?text=مئة+عام",
        pdf: "#"
    },
    {
        title: "القرآن الكريم",
        author: "الله سبحانه وتعالى",
        subject: "religious",
        image: "https://via.placeholder.com/200x300?text=القرآن",
        pdf: "#"
    },
    {
        title: "تاريخ العرب",
        author: "فيليب حتي",
        subject: "history",
        image: "https://via.placeholder.com/200x300?text=تاريخ+العرب",
        pdf: "#"
    },
    {
        title: "العادات الذرية",
        author: "جيمس كلير",
        subject: "self-dev",
        image: "https://via.placeholder.com/200x300?text=العادات+الذرية",
        pdf: "#"
    }
];

// تحميل الكتب من localStorage أو استخدام الافتراضية
let books = JSON.parse(localStorage.getItem("books")) || defaultBooks;

// نظام المستخدمين
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// دالة لحفظ المستخدمين
function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

// دالة لحفظ المستخدم الحالي
function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    updateUIForUser();
}

// دالة تسجيل الخروج
function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    updateUIForUser();
    window.location.reload(); // إعادة تحميل الصفحة لتحديث الواجهة
}

// تحديث واجهة المستخدم بناءً على حالة تسجيل الدخول
function updateUIForUser() {
    const userInfo = document.getElementById("user-info");
    const guestLinks = document.getElementById("guest-links");
    const adminBtn = document.getElementById("admin-btn");

    if (currentUser) {
        userInfo.style.display = "flex";
        guestLinks.style.display = "none";
        document.getElementById("welcome-message").innerText = `مرحباً، ${currentUser.name || currentUser.email}`;
        
        // صورة المستخدم (يمكن تخصيصها)
        const avatar = document.getElementById("user-avatar");
        avatar.src = currentUser.avatar || "https://via.placeholder.com/32x32?text=User";
        
        // إظهار زر المشرف إذا كان المستخدم هو admin
        if (currentUser.email === "admin@library.com") {
            adminBtn.style.display = "flex";
        } else {
            adminBtn.style.display = "none";
        }
    } else {
        userInfo.style.display = "none";
        guestLinks.style.display = "flex";
        adminBtn.style.display = "none";
    }
}

// إضافة مستخدم جديد (تسجيل)
function registerUser(name, email, password) {
    // التحقق من عدم وجود البريد
    if (users.find(u => u.email === email)) {
        return { success: false, message: "البريد الإلكتروني مستخدم بالفعل" };
    }
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // في مشروع حقيقي يجب تشفيرها
        avatar: "https://via.placeholder.com/32x32?text=User",
        createdAt: new Date().toISOString(),
        preferences: {
            favoriteSubjects: [],
            fontSize: "medium",
            darkMode: false,
            readingGoal: 0
        },
        stats: {
            booksRead: 0,
            favoriteBooks: [],
            currentlyReading: [],
            recentlyViewed: [] // آخر 3 كتب تم فتحها
        }
    };
    users.push(newUser);
    saveUsers();
    setCurrentUser(newUser);
    return { success: true };
}

// تسجيل الدخول
function loginUser(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        setCurrentUser(user);
        return { success: true };
    }
    return { success: false, message: "البريد أو كلمة المرور غير صحيحة" };
}

// إضافة كتاب إلى المفضلة
function toggleFavorite(book) {
    if (!currentUser) return false;
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return false;
    
    let favorites = users[userIndex].stats.favoriteBooks || [];
    const bookId = book.title + book.author; // معرف بسيط
    if (favorites.some(b => b.title === book.title && b.author === book.author)) {
        // إزالة
        favorites = favorites.filter(b => !(b.title === book.title && b.author === book.author));
    } else {
        // إضافة
        favorites.push(book);
    }
    users[userIndex].stats.favoriteBooks = favorites;
    saveUsers();
    currentUser = users[userIndex];
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    return true;
}

// التحقق إذا كان الكتاب في المفضلة
function isFavorite(book) {
    if (!currentUser) return false;
    return currentUser.stats?.favoriteBooks?.some(b => b.title === book.title && b.author === book.author) || false;
}

// تسجيل عرض كتاب (لـ "متابعة القراءة")
function trackBookView(book) {
    if (!currentUser) return;
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return;
    
    let recent = users[userIndex].stats.recentlyViewed || [];
    // إزالة أي تكرار لهذا الكتاب
    recent = recent.filter(b => !(b.title === book.title && b.author === book.author));
    // إضافة في البداية
    recent.unshift(book);
    // الاحتفاظ بآخر 3 فقط
    recent = recent.slice(0, 3);
    
    users[userIndex].stats.recentlyViewed = recent;
    saveUsers();
    currentUser = users[userIndex];
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

// عرض التصنيفات
let currentSubject = "all";
function renderSubjects() {
    const container = document.getElementById("subjects-list");
    container.innerHTML = "";
    subjects.forEach(sub => {
        const btn = document.createElement("button");
        btn.innerHTML = `<i class="fas ${sub.icon}"></i> ${sub.name}`;
        btn.onclick = () => {
            currentSubject = sub.id;
            document.getElementById("subject-title").innerText = sub.name;
            document.querySelectorAll("#subjects-list button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderBooks();

            if (window.innerWidth <= 768) {
                document.getElementById("sidebar").classList.remove("open");
            }
        };
        if (sub.id === currentSubject) btn.classList.add("active");
        container.appendChild(btn);
    });
}

// عرض الكتب
function renderBooks() {
    const container = document.getElementById("books");
    container.innerHTML = "";

    let filtered = books.filter(book => 
        currentSubject === "all" || book.subject === currentSubject
    );

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-books"><i class="fas fa-book-open"></i> لا توجد كتب في هذا التصنيف</div>';
        return;
    }

    filtered.forEach(book => {
        const subjectObj = subjects.find(s => s.id === book.subject);
        const subjectName = subjectObj ? subjectObj.name : book.subject;
        const favorite = isFavorite(book);

        const div = document.createElement("div");
        div.className = "book";
        // نمرر الكتاب كـ JSON مع استبدال علامات الاقتباس لتجنب أخطاء
        const bookData = JSON.stringify(book).replace(/"/g, '&quot;');
        div.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <button class="favorite-btn ${favorite ? 'active' : ''}" onclick="handleFavoriteClick(event, ${bookData})">
                <i class="fas fa-heart"></i>
            </button>
            <div class="book-content">
                <h3>${book.title}</h3>
                <div class="author"><i class="fas fa-user"></i> ${book.author}</div>
                <span class="subject-badge"><i class="fas ${subjectObj?.icon || 'fa-book'}"></i> ${subjectName}</span>
                <a class="view" href="${book.pdf}" target="_blank" onclick="trackView(${bookData})"><i class="fas fa-eye"></i> عرض الكتاب</a>
            </div>
        `;
        container.appendChild(div);
    });
}

// معالج النقر على زر المفضلة
window.handleFavoriteClick = function(event, book) {
    event.preventDefault();
    event.stopPropagation();
    if (!currentUser) {
        alert("الرجاء تسجيل الدخول أولاً");
        window.location.href = "login.html";
        return;
    }
    toggleFavorite(book);
    // تحديث حالة الزر
    const btn = event.currentTarget;
    btn.classList.toggle("active");
};

// تتبع عرض الكتاب
window.trackView = function(book) {
    trackBookView(book);
    return true; // يسمح بفتح الرابط
};

// البحث
document.getElementById("search").addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    const container = document.getElementById("books");
    container.innerHTML = "";

    const filtered = books.filter(book => 
        book.title.toLowerCase().includes(value) || 
        book.author.toLowerCase().includes(value)
    );

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-books"><i class="fas fa-search"></i> لا توجد نتائج للبحث</div>';
        return;
    }

    filtered.forEach(book => {
        const subjectObj = subjects.find(s => s.id === book.subject);
        const subjectName = subjectObj ? subjectObj.name : book.subject;
        const favorite = isFavorite(book);
        const bookData = JSON.stringify(book).replace(/"/g, '&quot;');

        const div = document.createElement("div");
        div.className = "book";
        div.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <button class="favorite-btn ${favorite ? 'active' : ''}" onclick="handleFavoriteClick(event, ${bookData})">
                <i class="fas fa-heart"></i>
            </button>
            <div class="book-content">
                <h3>${book.title}</h3>
                <div class="author"><i class="fas fa-user"></i> ${book.author}</div>
                <span class="subject-badge"><i class="fas ${subjectObj?.icon || 'fa-book'}"></i> ${subjectName}</span>
                <a class="view" href="${book.pdf}" target="_blank" onclick="trackView(${bookData})"><i class="fas fa-eye"></i> عرض الكتاب</a>
            </div>
        `;
        container.appendChild(div);
    });
});

// قائمة الجوال
document.getElementById("menu-btn").onclick = () => {
    document.getElementById("sidebar").classList.toggle("open");
};

// تسجيل الخروج
document.getElementById("logout-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
});

// عند تغيير حجم الشاشة، إذا أصبحت أكبر من 768 نقفل القائمة
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        document.getElementById("sidebar").classList.remove("open");
    }
});

// تهيئة الواجهة
updateUIForUser();
renderSubjects();
renderBooks();

// إضافة مستخدم افتراضي للمشرف إذا لم يكن موجوداً
if (!users.find(u => u.email === "admin@library.com")) {
    registerUser("Admin", "admin@library.com", "admin123");
}