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
        \DB::table('users_contacts')->truncate();


        $users = array(
            [
                'name' => 'Петя',
                'email' => 'admin@admin.dev',
                'login' => 'admin',
                'password' => Hash::make('testpass'),
                'group_id' => 1,
            ],
            [
                'name' => 'Вася',
                'email' => 'user@user.dev',
                'login' => 'user',

                'password' => Hash::make('testpass'),
                'group_id' => 2,

            ]
        );


        User::create($users[0]);
        User::create($users[1]);
        //\DB::table('users')->insert($users);

        /*$faker = Faker\Factory::create();
        $faker->addProvider(new Faker\Provider\Internet($faker));
        $faker->addProvider(new Faker\Provider\en_US\Person($faker));

        for ($i=0; $i < 500; $i++) {
            $user = [
                'email' => $faker->email,
                'name' => $faker->name,
                'password' => Hash::make('testpass'),
                'group_id' => 2
                ];
            User::create($user);
        }


        $users = User::getAllUsers();
        foreach($users as $user){
            $contacts=[];
            for ($i=0; $i < 50; $i++) {
                $user_id = rand(1,501);
                array_push($contacts, $user_id);
            }
            $user->Contacts()->sync($contacts);
        }

*/
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        Model::reguard();
    }
}
