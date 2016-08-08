(function () {
    'use strict';
    angular.module('backApp').controller('articleController', articleController);

    articleController.$inject = ['$scope', '$q', 'articleFactory'];

    function articleController($scope, $q, articleFactory) {

        $scope.env = {
            articles: []
        };


        function initPage(deferred) {

            var articlesDeffer = articleFactory.getAllArticle().then(function (articles) {
                $scope.env.articles = articles;
            });

            $q.all([articlesDeffer]).then(function () {
                deferred.resolve();
            });

            return deferred.promise;
        }

        $scope.$parent.init.push(initPage);


        $scope.add = function () {
            $scope.env.articles.unshift(articleFactory.create());
        };


        $scope.save = function (article) {
            article.update().then(function (response) {
                if (response.success == true) {
                    alertify.success("Статья сохранена");
                } else {
                    alertify.error(response.error);
                }
            })
        };

        $scope.delete = function (article, $index) {
            if (!article.id) {
                $scope.env.articles.splice($index, 1);
            } else {
                alertify.confirm('Удалить статью?', function (select) {
                    if (true === select) {
                        article.delete().then(function () {
                            $scope.env.articles.splice($index, 1);
                            alertify.success("Статья удалена");
                        });
                    }
                });
            }
        };

    }
})();

