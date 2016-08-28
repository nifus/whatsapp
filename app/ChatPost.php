<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class ChatPost extends Model
{


    protected
        $fillable = ['chat_id', 'user_id','message','is_system','is_sent','is_read','type','created_at','updated_at'],
        $table = 'chats_posts';


    public function User()
    {
        return $this->hasOne('App\User',  'id','user_id');
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['Time'] = $this->Time;
        $array['User'] = $this->User;
        return $array;
    }


    public function getTimeAttribute(){
        $date = new \DateTime($this->created_at);
        return $date->format('H:i');
    }

    static function getPosts($chat_id, $start, $limit){
        return self::where('chat_id',$chat_id)->get();
    }
}
