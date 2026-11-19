/**
 * 티켓시티 (Ticket City) 통합 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCalculator();
  initFaqAccordion();
  initScrollTop();
  highlightActiveNav();
});

/* 모바일 햄버거 메뉴 토글 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (!toggleBtn || !nav) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('open');
    const expanded = nav.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', expanded);
  });

  // 메뉴 바깥 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggleBtn.contains(e.target)) {
      nav.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* 현재 페이지 네비게이션 활성화 표시 */
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav a:not(.nav-channel)');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* 상품권 실시간 정산율 계산기 */
function initCalculator() {
  const cardTypeSelect = document.getElementById('calc-card-type');
  const amountInput = document.getElementById('calc-amount');
  const rateInput = document.getElementById('calc-rate-input');
  const quickBtns = document.querySelectorAll('.quick-amount-btn');

  const displayRate = document.getElementById('calc-rate-display');
  const displayFee = document.getElementById('calc-fee-display');
  const displayTotal = document.getElementById('calc-total-display');

  if ((!cardTypeSelect && !rateInput) || !amountInput) return;

  // 권종별 매입 지급률 기준
  // 백화점상품권: 92%, 각종 모바일 상품권: 90%, 기타 기프티콘: 상황에 따른 실시간 변동
  const ratesMap = {
    shinsegae: 0.92, // 신세계 백화점 92%
    lotte: 0.92, // 롯데 백화점 92%
    cultureland: 0.90, // 컬쳐랜드 90%
    mobile_culture: 0.90, // 모바일 문화상품권 90%
    booknlife: 0.90, // 도서문화(북앤라이프) 90%
    gifticon: null, // 기타 모바일 기프티콘: 상황에 따른 변동 시세
  };

  function formatNumber(num) {
    return Math.round(num).toLocaleString('ko-KR');
  }

  const initialAmount = amountInput.value;

  function updateCalculation() {
    // 숫자만 추출
    const rawVal = amountInput.value.replace(/[^0-9]/g, '');
    const amount = parseInt(rawVal, 10) || 0;

    // 화면 입력창 콤마 포맷팅
    if (rawVal) {
      amountInput.value = formatNumber(amount);
    }

    let rate;
    if (rateInput) {
      const rateText = rateInput.value.trim();
      const ratePercent = Number(rateText);
      if (rateText === '' || !Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
        rateInput.setAttribute('aria-invalid', 'true');
        if (displayRate) displayRate.textContent = '0~100% 입력';
        if (displayFee) displayFee.textContent = '-';
        if (displayTotal) displayTotal.textContent = '-';
        return;
      }

      rateInput.removeAttribute('aria-invalid');
      rate = ratePercent / 100;
    } else {
      rate = ratesMap[cardTypeSelect.value];
    }

    if (rate === null || rate === undefined) {
      // 기프티콘 등 변동 시세 권종
      if (displayRate) displayRate.textContent = '실시간 상담 확인';
      if (displayFee) displayFee.textContent = '품목별 상이';
      if (displayTotal) displayTotal.textContent = '채널톡 문의 시 즉시 확정';
    } else {
      const payout = amount * rate;
      const fee = amount - payout;

      if (displayRate) {
        displayRate.textContent = rateInput
          ? `${Number(rateInput.value)}%`
          : `${Math.round(rate * 100)}%`;
      }
      if (displayFee) {
        displayFee.textContent = fee > 0 ? `-${formatNumber(fee)}원` : '0원';
      }
      if (displayTotal) {
        displayTotal.textContent = `${formatNumber(payout)}원`;
      }
    }
  }

  // 빠른 금액 버튼 클릭
  quickBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const addValue = parseInt(btn.dataset.amount, 10);
      const currentVal = parseInt(amountInput.value.replace(/[^0-9]/g, ''), 10) || 0;
      const newVal = currentVal + addValue;
      amountInput.value = formatNumber(newVal);
      updateCalculation();
    });
  });

  // 금액 초기화 버튼 (존재할 경우)
  const resetBtn = document.getElementById('calc-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      amountInput.value = rateInput ? '0' : initialAmount;
      if (rateInput) rateInput.value = '0';
      updateCalculation();
    });
  }

  if (cardTypeSelect) cardTypeSelect.addEventListener('change', updateCalculation);
  if (rateInput) rateInput.addEventListener('input', updateCalculation);
  amountInput.addEventListener('input', updateCalculation);

  // 초기 1회 실행
  updateCalculation();
}

/* FAQ 아코디언 및 카테고리 필터 */
function initFaqAccordion() {
  const tabs = document.querySelectorAll('.category-tab');
  const faqItems = document.querySelectorAll('.faq-item');

  if (tabs.length === 0 || faqItems.length === 0) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filterCategory = tab.dataset.category;

      faqItems.forEach((item) => {
        const itemCategory = item.dataset.category;
        if (filterCategory === 'all' || itemCategory === filterCategory) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* 맨 위로 스크롤 버튼 */
function initScrollTop() {
  const topBtn = document.getElementById('btn-scroll-top');
  if (!topBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      topBtn.style.opacity = '1';
      topBtn.style.pointerEvents = 'auto';
    } else {
      topBtn.style.opacity = '0';
      topBtn.style.pointerEvents = 'none';
    }
  });

  topBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}
