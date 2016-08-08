<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title translate>Чат</title>
    <link rel="stylesheet" href="components/bootstrap/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body ng-app="frontApp">

{!! $composerHeaderMenu  !!}



<div class="container" style="margin-top:70px">
    @yield('content')
</div>


</body>

<script src="components/angular/angular.js"></script>
<script src="components/satellizer/dist/satellizer.min.js"></script>
<script src="components/angular-cookies/angular-cookies.min.js"></script>

<script src="apps/core/core.js"></script>
<script src="apps/core/user/userFactory.js"></script>
<script src="apps/core/user/userService.js"></script>
<script src="apps/core/cacheService.js"></script>


<script src="apps/frontApp/frontApp.js"></script>
<script src="apps/frontApp/signIn/signInController.js"></script>


</html>