<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\User;
use App\Group;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Model::unguard();
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        \DB::table('users')->truncate();


        $users = array(
            [
                'name' => 'Admin',
                'email' => 'admin@admin.dev',
                'password' => Hash::make('testpass'),
                'group_id' => 1,
                'access' => [
                    "config"=>true,
                    "users"=>true,
                    "agent"=>true,
                    "company"=>true,
                    "articles"=>true,
                    "editPayments"=>true,
                    "payments"=>true,
                    "log"=>true,

                ]
            ],
            [
                'name' => 'User',
                'email' => 'user@user.dev',
                'password' => Hash::make('testpass'),
                'group_id' => 2
            ],
        );
        User::create($users[0]);
        User::create($users[1]);
        //\DB::table('users')->insert($users);




        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        Model::reguard();
    }
}
