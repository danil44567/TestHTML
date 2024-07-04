// Ваши вопросы и варианты ответов
let questions = [];
const quizTitle = "Супер тест по Genshin Impact"

const adTimeout = 61000


YaGames
  .init()
  .then(ysdk => {
    console.log('Yandex SDK initialized');
    window.ysdk = ysdk;
    ysdk.adv.showFullscreenAdv();
    ysdk.features.LoadingAPI?.ready();

    fetch('questions.json')
    .then(response => response.json())
    .then(json => {
      questions = json
      showMenu()
      setTimeout(warningAd, adTimeout)
    })
  });

const states = {
  menu: 1,
  quiz: 2,
  final: 3,
}

function showMenu() {
  state = states.menu
  quizContainer.innerHTML = `<h1>Супер тест по Genshin Impact</h1>
<button onclick="initQuiz()">Начать тест!</button>`
}

let state = states.menu
let isShowingAd = false

let currentQuestionIndex = 0;
let correctAnswers = 0;
let isCheckingAnswer = false;


const quizContainer = document.querySelector("#quiz-container"); // Получаем контейнер один раз

function loadQuestion(index) {
  const questionContainer = quizContainer.querySelector(".question");
  const optionsContainer = quizContainer.querySelector(".options");
  const feedbackElement = quizContainer.querySelector(".feedback");

  questionContainer.textContent = questions[index].question;
  optionsContainer.innerHTML = "";

  if (feedbackElement) {
    feedbackElement.remove();
  }

  questions[index].options.forEach((option, optionIndex) => {
    const optionElement = document.createElement("div");
    optionElement.classList.add("option", "fade-in");
    optionElement.textContent = option;
    optionElement.addEventListener("click", () => selectOption(optionElement, optionIndex));
    optionsContainer.appendChild(optionElement);
  });

  updateCounter(index);
}

function selectOption(optionElement, selectedIndex) {
  if (isCheckingAnswer) {
    return; // Блокируем дополнительный ввод во время проверки
  }

  isCheckingAnswer = true; // Устанавливаем флаг проверки
  const correctIndex = questions[currentQuestionIndex].correctIndex;

  const options = document.querySelectorAll(".option");
  options.forEach(option => option.classList.remove("selected"));

  if (selectedIndex === correctIndex) {
    options[selectedIndex].classList.add("correct");
    correctAnswers++;
  } else {
    options[selectedIndex].classList.add("incorrect");
  }

  options.forEach((option, index) => {
    if (index !== selectedIndex) {
      option.classList.remove("fade-in");
      option.classList.add("fade-out");
    }
  });

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      if (!isShowingAd) {
        loadQuestion(currentQuestionIndex);
      }
    } else {
      state = states.final;
      if (!isShowingAd) {
        showFinalScore();
      }
    }
    isCheckingAnswer = false; // Снимаем флаг проверки после завершения
  }, 1000);
}


function updateCounter(index) {
  const counterElement = document.querySelector(".counter");
  counterElement.textContent = `Вопрос ${index + 1} из ${questions.length}`;
}

function fillQuizContainer() {
  quizContainer.innerHTML = `
<h1>${quizTitle}</h1>
<p class="question"></p>
<div class="options"></div>
<p class="counter">Вопрос 1 из ${questions.length}</p>
`;
}

function initQuiz() {
  fillQuizContainer()
  currentQuestionIndex = 0;
  correctAnswers = 0;
  state = states.quiz;
  loadQuestion(currentQuestionIndex);
}

function showFinalScore() {
  state = states.final;
  const quizContainer = document.querySelector("#quiz-container");
  const resultsContainer = document.createElement("div");
  resultsContainer.classList.add("results-container");
  resultsContainer.innerHTML = `
<p>Тест завершен! Вы правильно ответили на <span class="correct-answers">${correctAnswers}</span> вопросов из <span class="total-questions">${questions.length}</span>.</p>
<button class="restart-btn">Начать сначала</button>
`;
  const correctAnswersPercentage = (correctAnswers / questions.length) * 100;

  const correctAnswersElement = resultsContainer.querySelector(".correct-answers");

  correctAnswersElement.textContent = correctAnswers;

  if (correctAnswersPercentage >= 90) {
    correctAnswersElement.style.color = "green";
  } else if (correctAnswersPercentage >= 50) {
    correctAnswersElement.style.color = "orange";
  } else {
    correctAnswersElement.style.color = "red";
  }
  quizContainer.innerHTML = ""; // Очищаем контейнер
  quizContainer.appendChild(resultsContainer); // Добавляем результаты

  const restartButton = quizContainer.querySelector(".restart-btn");
  restartButton.addEventListener("click", showMenu);
}

function warningAd() {
  isShowingAd = true
  setTime(2)
}

function setTime(seconds) {
  if (seconds > 0) {
    quizContainer.innerHTML = `<h2>Реклама через</h2><h1>${seconds}</h1>`
    setTimeout(() => setTime(seconds - 1), 1001)
  }
  else {
    setTimeout(() => {
      isShowingAd = false
      if (state === states.menu) {
        showMenu()
      }
      else if (state === states.quiz) {
        fillQuizContainer()
        loadQuestion(currentQuestionIndex)
        isCheckingAnswer = false
      }
      else if (state === states.final) {
        showFinalScore()
      }
      setTimeout(warningAd, adTimeout)
    }, 1001)
    ysdk.adv.showFullscreenAdv();
  }
}