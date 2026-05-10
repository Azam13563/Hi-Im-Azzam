// elements
const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');
const closeMenu = document.getElementById('closeMenu');
const themeToggle = document.getElementById('themeToggle');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const openPlanBtn = document.getElementById('openPlan');
const openPlanFromMenu = document.getElementById('openPlanFromMenu');

// عناصر إدارة الخطط
const addPlanBtn = document.getElementById('addPlanBtn');
const planModal = document.getElementById('planModal');
const closeModal = document.getElementById('closeModal');
const submitPlanBtn = document.getElementById('submitPlanBtn');
const planCardsContainer = document.getElementById('planCardsContainer');
const modalTitle = document.getElementById('modalTitle');

// عناصر مكتبة الأدعية
const categoryBtns = document.querySelectorAll('.category-btn');
const libraryItems = document.querySelectorAll('.library-item');

// حالة التطبيق
let currentEditingPlanId = null;
let planIdCounter = 3; // البدء من 3 لأن لدينا خطة مبدئية

// UTILS
function showSideMenu(){
  sideMenu.classList.remove('hidden');
  overlay.classList.remove('hidden');
  sideMenu.setAttribute('aria-hidden','false');
}

function hideSideMenu(){
  sideMenu.classList.add('hidden');
  overlay.classList.add('hidden');
  sideMenu.setAttribute('aria-hidden','true');
}

// theme persistence
const THEME_KEY = 'app-theme';
function applyTheme(theme){
  if(theme === 'dark'){
    document.documentElement.setAttribute('data-theme','dark');
    themeToggle.checked = true;
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.checked = false;
  }
  localStorage.setItem(THEME_KEY, theme);
}

const saved = localStorage.getItem(THEME_KEY) || 'light';
applyTheme(saved);

// bottom nav actions
navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    // set active visually
    navItems.forEach(n => n.classList.remove('active'));
    btn.classList.add('active');

    // show correct page
    pages.forEach(p => p.classList.remove('active'));
    const targetEl = document.getElementById(target);
    if(targetEl) pShow(targetEl);
  });
});

// common function to show page
function pShow(el){
  el.classList.add('active');
}

// Plan loading flow - بدون تحميل
function openPlanFlow(){
  // activate plan page and bottom nav highlight
  navItems.forEach(n => n.classList.remove('active'));
  const planNav = Array.from(navItems).find(n => n.dataset.target === 'planPage');
  if(planNav) planNav.classList.add('active');

  pages.forEach(p => p.classList.remove('active'));
  const planPg = document.getElementById('planPage');
  if(planPg) planPg.classList.add('active');

  // close side menu if open
  hideSideMenu();
}

// Modal functionality
function openPlanModal(planId = null) {
  currentEditingPlanId = planId;
  
  if (planId) {
    // وضع التعديل
    modalTitle.textContent = 'تعديل الخطة';
    const planCard = document.querySelector(`[data-plan-id="${planId}"]`);
    const title = planCard.querySelector('h4').textContent;
    const goal = planCard.querySelector('.plan-goal').textContent.replace('الهدف:', '').trim();
    
    document.getElementById('planTitle').value = title;
    document.getElementById('planGoal').value = goal;
  } else {
    // وضع الإضافة
    modalTitle.textContent = 'إضافة خطة جديدة';
    document.getElementById('planTitle').value = '';
    document.getElementById('planGoal').value = '';
    document.getElementById('planDuration').value = '4';
  }
  
  planModal.classList.remove('hidden');
  overlay.classList.remove('hidden');
}

function closePlanModal() {
  planModal.classList.add('hidden');
  overlay.classList.add('hidden');
  currentEditingPlanId = null;
}

function submitPlan() {
  const planTitle = document.getElementById('planTitle').value.trim();
  const planGoal = document.getElementById('planGoal').value.trim();
  
  if(!planTitle || !planGoal) {
    alert('يرجى ملء جميع الحقول المطلوبة');
    return;
  }
  
  if (currentEditingPlanId) {
    // تحديث الخطة الموجودة
    updatePlan(currentEditingPlanId, planTitle, planGoal);
  } else {
    // إضافة خطة جديدة
    addNewPlan(planTitle, planGoal);
  }
  
  closePlanModal();
}

function addNewPlan(title, goal) {
  const planId = planIdCounter++;
  
  const newPlanCard = document.createElement('div');
  newPlanCard.className = 'plan-card';
  newPlanCard.setAttribute('data-plan-id', planId);
  newPlanCard.innerHTML = `
    <div class="plan-card-header">
      <h4>${title}</h4>
      <div class="plan-actions">
        <button class="edit-plan" data-plan-id="${planId}"><i class="fas fa-edit"></i></button>
        <button class="delete-plan" data-plan-id="${planId}"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <div class="plan-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: 0%"></div>
      </div>
      <span>0% مكتمل</span>
    </div>
    <div class="plan-goal">
      <strong>الهدف:</strong> ${goal}
    </div>
  `;
  
  planCardsContainer.appendChild(newPlanCard);
  attachPlanEventListeners(newPlanCard);
}

function updatePlan(planId, title, goal) {
  const planCard = document.querySelector(`[data-plan-id="${planId}"]`);
  if (planCard) {
    planCard.querySelector('h4').textContent = title;
    planCard.querySelector('.plan-goal').innerHTML = `<strong>الهدف:</strong> ${goal}`;
  }
}

function deletePlan(planId) {
  if (confirm('هل أنت متأكد من حذف هذه الخطة؟')) {
    const planCard = document.querySelector(`[data-plan-id="${planId}"]`);
    if (planCard) {
      planCard.remove();
    }
  }
}

function attachPlanEventListeners(planCard) {
  const planId = planCard.getAttribute('data-plan-id');
  const editBtn = planCard.querySelector('.edit-plan');
  const deleteBtn = planCard.querySelector('.delete-plan');
  
  editBtn.addEventListener('click', () => openPlanModal(planId));
  deleteBtn.addEventListener('click', () => deletePlan(planId));
}

// مكتبة الأدعية والأحاديث
function filterLibrary(category) {
  libraryItems.forEach(item => {
    if (category === 'all' || item.getAttribute('data-category') === category) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// إضافة المستمعين للأحداث
overlay.addEventListener('click', function(e) {
  if (e.target === overlay) {
    hideSideMenu();
    closePlanModal();
  }
});

hamburger.addEventListener('click', showSideMenu);
closeMenu.addEventListener('click', hideSideMenu);

themeToggle.addEventListener('change', () => {
  applyTheme(themeToggle.checked ? 'dark' : 'light');
});

// wire plan openers
openPlanBtn.addEventListener('click', openPlanFlow);
openPlanFromMenu.addEventListener('click', openPlanFlow);

// إدارة الخطط
addPlanBtn.addEventListener('click', () => openPlanModal());
closeModal.addEventListener('click', closePlanModal);
submitPlanBtn.addEventListener('click', submitPlan);

// مكتبة الأدعية
categoryBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    categoryBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const category = this.getAttribute('data-category');
    filterLibrary(category);
  });
});

// keyboard accessibility: ESC to close side menu and modal
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') {
    hideSideMenu();
    closePlanModal();
  }
});

// إضافة المستمعين للخطط الموجودة مسبقًا
document.querySelectorAll('.plan-card').forEach(card => {
  attachPlanEventListeners(card);
});

// تحسينات إضافية: إضافة تأثيرات عند التمرير
document.addEventListener('DOMContentLoaded', function() {
  // إضافة تأثيرات للبطاقات عند التمرير
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // تطبيق التأثير على البطاقات
  const cards = document.querySelectorAll('.ad-banner, .learn-card, .big-card, .start-card, .feature-card, .teacher-card, .stat-card, .plan-card, .library-item');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
  
  // إضافة تأثيرات للتنقل السفلي
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach(button => {
    button.addEventListener('click', function() {
      // إزالة النشاط من جميع الأزرار
      navButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      // إضافة النشاط للزر المحدد
      this.classList.add('active');
    });
  });
});

// تحسينات للتفاعل مع الأزرار
document.querySelectorAll('.action, .contact-btn, .ad-action, .item-action').forEach(button => {
  button.addEventListener('click', function() {
    // تأثير النقر على الأزرار
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = '';
    }, 150);
  });
});

// إضافة تأثيرات للجرس
const notification = document.querySelector('.notification');
if (notification) {
  notification.addEventListener('click', function() {
    this.style.transform = 'scale(1.1)';
    setTimeout(() => {
      this.style.transform = '';
    }, 200);
  });
}

// تأثير لبطاقة ابدأ بتعلم الفاتحة
const learnCard = document.querySelector('.learn-card');
if (learnCard) {
  learnCard.addEventListener('click', function() {
    this.style.transform = 'scale(0.98)';
    setTimeout(() => {
      this.style.transform = '';
    }, 150);
  });
}