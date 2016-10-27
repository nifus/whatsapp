<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\User;
use App\Group;
use App\Chat;

class UserTestSeeder extends Seeder
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
        \DB::table('chats_posts')->truncate();
        \DB::table('chats_members')->truncate();
        \DB::table('chats')->truncate();
        $list = [];

        $users = array(
            [
                'name' => 'Общий друг',
                'email' => 'admin@admin.dev',
                'login' => 'friend',
                'password' => Hash::make('testpass'),
                'group_id' => 2,
                'history'=>1
            ],

        );


        User::create($users[0]);
        //User::create($users[1]);
        //\DB::table('users')->insert($users);

        $faker = Faker\Factory::create();
        $faker->addProvider(new Faker\Provider\Internet($faker));
        $faker->addProvider(new Faker\Provider\en_US\Person($faker));

        for ($i=0; $i < 200; $i++) {
            $email = $faker->email;
            $user = [
                'email' => $email,
                'name' => $faker->name,
                'login' => $email,
                'password' => Hash::make('testpass'),
                'group_id' => 2
                ];
            User::create($user);
            array_push($list,$email);

        }
        file_put_contents( public_path('uploads/tests/users.json'), json_encode($list) );


        $users = User::getAllUsers();
        foreach($users as $user){
            $contacts=[];
            for ($i=0; $i < 50; $i++) {
                $user_id = rand(1,200);
                array_push($contacts, $user_id);
            }
            $user->Contacts()->sync($contacts);
        }


        for ($i=1; $i <= 200; $i++) {
            $user_id = $i;
            $user = [
                //'name' => $faker->name,
                'author' => $user_id,//$users[$user_id]->id,
            ];

            $ids = [];
            for( $j=0;$j<50;$j++){
                $id = rand(1,200);
               if ( $id!=$user_id && !in_array($id, $ids) ){
                   array_push($ids, $id);
               }

            }
            foreach( $ids as $id ){
                $chat = Chat::create($user);
                $members = [
                    [
                        'user_id'=>$user_id,
                        'is_admin'=>1
                    ]
                ];

                array_push($members,[
                    'user_id'=>$id,
                    'is_admin'=>0
                ]);

                $chat->Members()->sync($members);
            }




           // $chat->update(['last_post'=>$post->id]);
        }


        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        Model::reguard();
    }
}
