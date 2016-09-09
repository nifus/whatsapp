    (function (angular) {
    'use strict';



    function uploadDirective($compile) {
        return {
            ngModel:'require',
            replace:true,
            restrict: 'E',
            link: uploadLink,
            controller: uploadController,
            scope:{
                ngModel:'=',
                numberOfFiles:'@',
                ngChange:'=',
                hideResult:'@'
            }
        };


        function uploadLink(scope,element,el2){

            if ( !scope.hideResult ){
                var html = '<div class="row" style="margin:10px"><div style="margin:5px" class="col-md-3" ng-repeat="item in ngModel" style="text-align: right">' +
                    '<img ng-src="data:{{item.filetype}};base64,{{item.base64}}" style="width: 200px" ng-show="item.base64!=undefined">' +
                    '<img ng-src="{{item.base64==undefined ? item : \'\'}}" style="width: 200px" ng-show="item.base64==undefined">' +
                    '<button type="button" style="position: absolute;left:15px;top:0px" ng-click="deleteItem($index)" class="btn btn-danger">' +
                    '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div></div>';
            }else{
                var html = '';
            }


            if ( scope.numberOfFiles==undefined || scope.numberOfFiles<=1 ){
                html += '<input type="file" ng-model="file"  base-sixty-four-input style="visibility: hidden; display: none"  >';
            }else{
                html += '<input type="file" ng-model="file" multiple base-sixty-four-input style="visibility: hidden; display: none"  >';
            }
            var linkFn = $compile(html);

            var content = linkFn(scope);
            element.append(content);
            if (element.find('button').length==1){
                scope.button = element.find('button');
            }else if (element.find('img').length==1){
                scope.button = element.find('img');
            }else if (element.find('a').length==1){
                scope.button = element.find('a');
            }

           // scope.buttonText = scope.button.html();

            scope.button.click( function(){
                element.find('input[type=file]').trigger('click')
            })

        }

        uploadController.$inject = ['$scope'];

        function uploadController($scope){

            $scope.allowAddNewFiles = false;
            $scope.count = 0;
            var max = $scope.numberOfFiles==undefined || $scope.numberOfFiles<=1 ? 1 :  $scope.numberOfFiles;

            $scope.$watch('ngModel',function(value){
                if ( angular.isString(value) ){
                    $scope.ngModel = [value]
                }

                rematch(value)
            },true);

            $scope.$watch('file',function(value){
                if ( value==null ){
                    return false;
                }

                if ( !$scope.ngModel ){
                    $scope.ngModel = max==1 ? [value] : [];
                }

                if ( angular.isArray($scope.ngModel) && angular.isArray(value) ){
                    for( var i in value ){
                        if ( $scope.ngModel.length< max)
                            $scope.ngModel.push(value[i])
                    }
                }else if ( angular.isArray($scope.ngModel) && angular.isObject(value) ){
                        if ( $scope.ngModel.length< max)
                            $scope.ngModel.push(value)

                }
                if ($scope.ngChange){
                    $scope.ngChange($scope.ngModel );
                }

            },true);


            $scope.deleteItem = function(index){
                if ( angular.isArray($scope.ngModel) ){
                    $scope.ngModel.splice(index,1);
                }

                rematch($scope.ngModel);
                if ($scope.ngChange){
                    $scope.ngChange($scope.ngModel);
                }

            };

            function rematch(value){
                if ( $scope.hideResult ){
                    return false;
                }
                var allowAddNewFiles = ( max==1 && value!=undefined && value.length==1 ) ? false : true;
                allowAddNewFiles = ( max>1 && angular.isArray($scope.ngModel) && $scope.ngModel.length<max ) ? true : allowAddNewFiles;

                if ( allowAddNewFiles==false ){
                    $scope.button.css('display','none')
                }else{
                    $scope.button.css('display','block')
                }
            }
        }




    }

    angular.module('core').directive('upload', uploadDirective);


})(window.angular);
