var app = angular.module("flags", []);

app.controller("flagsCtrl", function ($scope, $http) {
    $scope.resetQuiz = function() {
        $scope.quizStarted = false;
        $scope.quizCompleted = false;
        $scope.countries = [];
        $scope.numberOfQuestions = 10;
        $scope.answersPerQuestion = 4;
        $scope.quiz = {};
        $scope.currentQuestionIndex = 0;
        $scope.quizScore = -1;
    }

    $scope.resetGame = function() {
        $scope.highScore = 0;
    }

    $scope.shuffle = function (array) {
        var tmp, current, top = array.length;
        if (top) while (--top) {
            current = Math.floor(Math.random() * (top + 1));
            tmp = array[current];
            array[current] = array[top];
            array[top] = tmp;
        }
        return array;
    }

    $scope.createQuiz = function () {
        var controllerScope = this;
        controllerScope.resetQuiz();

        $http.get("https://restcountries.eu/rest/v2/all").then(function (response) {
            controllerScope.countries = response.data;

            if (controllerScope.countries.length > 0) {

                var cleanedCountries = [];
                for (var i=0; i<controllerScope.countries.length; i++) {
                    if (controllerScope.countries[i].name && controllerScope.countries[i].capital)
                        cleanedCountries.push(controllerScope.countries[i]);
                }
                controllerScope.countries = cleanedCountries;

                for (var a = [], i = 0; i < controllerScope.countries.length; ++i)
                    a[i] = i;
                a = controllerScope.shuffle(a);
            
                var quizQuestions = [];
                var quizPossibleAnswers = [];
                var quizCorrectAnswers = [];
                var countryIndex = 0;
                for (var i = 0; i < controllerScope.numberOfQuestions; i++) {
                    var questionIndex = Math.floor(Math.random()*controllerScope.answersPerQuestion) + countryIndex;
                    var questionText = "What is the capital of " + controllerScope.countries[a[questionIndex]].name + "?";
                    quizQuestions.push(questionText);
                    quizCorrectAnswers.push(controllerScope.countries[a[questionIndex]].capital);
                    var questionPossibleAnswers = [];
                    for (var j=countryIndex; j<(countryIndex + controllerScope.answersPerQuestion); j++)
                        questionPossibleAnswers.push(controllerScope.countries[a[j]].capital);
                    quizPossibleAnswers.push(questionPossibleAnswers);
                    countryIndex += controllerScope.answersPerQuestion;
                }

                var quizSelectedAnswers = [];
                for (var i=0; i<quizCorrectAnswers.length; i++)
                    quizSelectedAnswers.push(""); 

                controllerScope.quiz.questions = quizQuestions;
                controllerScope.quiz.possibleAnswers = quizPossibleAnswers;
                controllerScope.quiz.correctAnswers = quizCorrectAnswers;
                controllerScope.quiz.selectedAnswers = quizSelectedAnswers;
                controllerScope.currentQuestionIndex = 0;

                controllerScope.quizStarted = true;
            }
        });
    }

    $scope.previousClicked = function() {
        this.currentQuestionIndex--;
    }
    
    $scope.nextClicked = function() {
        this.currentQuestionIndex++;
    }

    $scope.calculateQuizScore = function() {
        if (this.quiz && this.quiz.selectedAnswers && this.quiz.selectedAnswers.length > 0 && this.quiz.correctAnswers && this.quiz.correctAnswers.length > 0) {
           var quizSelectedAnswers = this.quiz.selectedAnswers;
           var quizCorrectAnswers = this.quiz.correctAnswers;
           if (quizSelectedAnswers.length != quizCorrectAnswers.length) {
            return -1; 
           }
           var numberOfCorrectAnswers = 0;
           for (var i=0; i<quizSelectedAnswers.length; i++) {
               if (quizSelectedAnswers[i] == quizCorrectAnswers[i])
                    numberOfCorrectAnswers++;
           }
           var score = numberOfCorrectAnswers * 10;
           return score;
        }
    }

    $scope.finishClicked = function() {
        if (this.quiz && this.quiz.selectedAnswers && this.quiz.selectedAnswers.length > 0) {
            var i = 0;
            var foundNoAnswer = false;
            while (i<this.quiz.selectedAnswers.length && !foundNoAnswer) {
                if (!this.quiz.selectedAnswers[i])
                    foundNoAnswer = true;
                i++;
            }

            var continueProcessing = true;
            if (foundNoAnswer) {
                if (!confirm("You have not answered all the questions. Are you sure you want to continue?"))
                    continueProcessing = false;
            }

            if (continueProcessing) {
                var score = this.calculateQuizScore();
                if (score == -1) {
                    alert("An unexpected error occured while calculating your score.");
                } else {
                    this.quizCompleted = true;
                    this.quizScore = score;
                    if (this.quizScore > this.highScore)
                        this.highScore = this.quizScore;
                }
            }
        }
    }

    $scope.resetGame();
});