<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\User;
use App\Group;

class GroupTableSeeder extends Seeder
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

        \DB::table('groups')->truncate();

        $groups = [
            [
                'id'=> 1,
                'name' => 'Administrator',

            ],
            [
                'id'=> 2,
                'name' => 'User',

            ],

        ];
        foreach( $groups as $group ){
            Group::create($group);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        Model::reguard();
    }
}
