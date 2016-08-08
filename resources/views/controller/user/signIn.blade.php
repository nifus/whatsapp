@extends('index')
@section('content')
    <div class="col-sm-4 col-sm-offset-4" ng-controller="signInController">
        <div class="well">
            <h3>Авторизация</h3>

            <form name="loginForm">
                <div class="alert alert-danger" role="alert" ng-show="env.error">{env.error}</div>
                <div class="form-group">
                    <input type="email" class="form-control" placeholder="Логин" ng-model="model.email" required>
                </div>
                <div class="form-group">
                    <input type="password" class="form-control" placeholder="*****" ng-model="model.password"
                           required>
                </div>
                <button class="btn btn-primary" ng-click="signIn(model.email, model.password)" ng-disabled="loginForm.$invalid || env.waiting==true">
                    Отправить
                </button>
            </form>
            <br>
        </div>
    </div>
@stop