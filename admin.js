// قائمة التصنيفات (مطابقة للصفحة الرئيسية)
const subjects = [
    { id: "stories", name: "قصص" },
    { id: "novels", name: "روايات" },
    { id: "religious", name: "دينية" },
    { id: "science", name: "علمية" },
    { id: "history", name: "تاريخية" },
    { id: "self-dev", name: "تنمية بشرية" }
];

// تحميل الكتب من localStorage
let books = JSON.parse(localStorage.getItem("books")) || [];

// تحميل المستخدمين للإحصائيات
let users = JSON.parse(localStorage.getItem("users")) || [];

// التحقق من أن المستخدم الحالي هو المشرف
function checkAdmin() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.email !== "admin@library.com") {
        window.location.href = "index.html";
    }
}
checkAdmin();

// عرض الإحصائيات
function renderStats() {
    document.getElementById("total-books").innerText = books.length;
    
    // عدد التصنيفات المستخدمة
    const usedCategories = new Set(books.map(book => book.subject)).size;
    document.getElementById("total-categories").innerText = usedCategories;
    
    document.getElementById("total-users").innerText = users.length;
}

// عرض الكتب في الجدول
function renderBooks() {
    const container = document.getElementById("books-list");
    if (!container) return;

    if (books.length === 0) {
        container.innerHTML = `<tr><td colspan="5" class="no-books-message"><i class="fas fa-book-open"></i> لا توجد كتب بعد، أضف كتاباً الآن</td></tr>`;
        return;
    }

    container.innerHTML = "";
    books.forEach((book, index) => {
        const subjectName = subjects.find(s => s.id === book.subject)?.name || book.subject;
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${book.image}" alt="${book.title}" class="book-image" onerror="this.src='https://via.placeholder.com/50x70?text=No+Image'"></td>
            <td>
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
            </td>
            <td>${book.author}</td>
            <td><span class="subject-badge">${subjectName}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="openEditModal(${index})" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteBook(${index})" title="حذف"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        container.appendChild(row);
    });
}

// إضافة كتاب جديد
document.getElementById("book-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const newBook = {
        title: document.getElementById("title").value.trim(),
        author: document.getElementById("author").value.trim(),
        subject: document.getElementById("subject").value,
        image: document.getElementById("image").value.trim(),
        pdf: document.getElementById("pdf").value.trim()
    };

    // التحقق من المدخلات
    if (!newBook.title || !newBook.author || !newBook.subject || !newBook.image || !newBook.pdf) {
        showMessage("يرجى ملء جميع الحقول", "error");
        return;
    }

    books.push(newBook);
    localStorage.setItem("books", JSON.stringify(books));
    
    // إعادة تعيين النموذج
    e.target.reset();
    
    // تحديث الجدول والإحصائيات
    renderBooks();
    renderStats();
    
    showMessage("✅ تمت إضافة الكتاب بنجاح", "success");
});

// حذف كتاب
window.deleteBook = function(index) {
    if (confirm("هل أنت متأكد من حذف هذا الكتاب؟")) {
        books.splice(index, 1);
        localStorage.setItem("books", JSON.stringify(books));
        renderBooks();
        renderStats();
        showMessage("✅ تم حذف الكتاب بنجاح", "success");
    }
};

// فتح نافذة التعديل
window.openEditModal = function(index) {
    const book = books[index];
    document.getElementById("edit-index").value = index;
    document.getElementById("edit-title").value = book.title;
    document.getElementById("edit-author").value = book.author;
    document.getElementById("edit-subject").value = book.subject;
    document.getElementById("edit-image").value = book.image;
    document.getElementById("edit-pdf").value = book.pdf;
    
    document.getElementById("edit-modal").classList.add("active");
};

// إغلاق نافذة التعديل
window.closeEditModal = function() {
    document.getElementById("edit-modal").classList.remove("active");
};

// حفظ التعديلات
document.getElementById("edit-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const index = document.getElementById("edit-index").value;
    const updatedBook = {
        title: document.getElementById("edit-title").value.trim(),
        author: document.getElementById("edit-author").value.trim(),
        subject: document.getElementById("edit-subject").value,
        image: document.getElementById("edit-image").value.trim(),
        pdf: document.getElementById("edit-pdf").value.trim()
    };

    if (!updatedBook.title || !updatedBook.author || !updatedBook.subject || !updatedBook.image || !updatedBook.pdf) {
        showMessage("يرجى ملء جميع الحقول", "error");
        return;
    }

    books[index] = updatedBook;
    localStorage.setItem("books", JSON.stringify(books));
    
    closeEditModal();
    renderBooks();
    renderStats();
    
    showMessage("✅ تم تحديث الكتاب بنجاح", "success");
});

// عرض الرسائل
function showMessage(text, type) {
    const messageDiv = document.getElementById("form-message");
    if (!messageDiv) return;
    
    messageDiv.innerHTML = `<div class="alert alert-${type}"><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${text}</div>`;
    
    setTimeout(() => {
        messageDiv.innerHTML = "";
    }, 3000);
}

// إغلاق النافذة عند النقر خارجها
window.onclick = function(event) {
    const modal = document.getElementById("edit-modal");
    if (event.target === modal) {
        closeEditModal();
    }
};

// تهيئة الصفحة
renderStats();
renderBooks();