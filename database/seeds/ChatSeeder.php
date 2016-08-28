<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\User;
use App\Chat;
use App\ChatPost;

class ChatTableSeeder extends Seeder
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

        \DB::table('chats')->truncate();
        \DB::table('chats_members')->truncate();
        \DB::table('chats_posts')->truncate();
        //\DB::table('users_contacts')->truncate();

        $users = User::getAllUsers();


        $faker = Faker\Factory::create();
        $faker->addProvider(new Faker\Provider\Internet($faker));
        $faker->addProvider(new Faker\Provider\en_US\Person($faker));
        $faker->addProvider(new Faker\Provider\Lorem($faker));

        for ($i=0; $i < 20; $i++) {
            $user_id = 1;//rand(0, sizeof($users)-1);
            $user = [
                //'name' => $faker->name,
                'author' => $user_id,//$users[$user_id]->id,
                ];

            $chat = Chat::create($user);
            $members = [
                [
                    'user_id'=>$user_id,
                    'is_admin'=>1
                ]
            ];


                $user_id = rand(0, sizeof($users)-1);
                array_push($members,[
                    'user_id'=>$users[$user_id]->id,
                    'is_admin'=>0
                ]);

            $chat->Members()->sync($members);


                //  посты
            for($j=1;$j<5000;$j++){
                $user_id = rand(1, sizeof($members)-1);

                $post = [
                    'user_id'=>$members[$user_id]['user_id'],
                    'message'=>$faker->paragraph,
                    'is_system'=>0,
                    'is_sent'=>1,
                    'is_read'=>1,
                    'chat_id'=>$chat->id
                ];

                $post = ChatPost::create($post);
            }

            $chat->update(['last_post'=>$post->id]);
        }


       /* $users = User::getAllUsers();
        foreach($users as $user){
            $contacts=[];
            for ($i=0; $i < 50; $i++) {
                $user_id = rand(1,501);
                array_push($contacts, $user_id);
            }
            $user->Contacts()->sync($contacts);
        }*/


        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        Model::reguard();
    }
}
