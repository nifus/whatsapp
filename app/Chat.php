<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class Chat extends Model
{


    protected $table = 'chats';


    protected $fillable = ['name', 'created_at', 'updated_at', 'avatar', 'author', 'last_post', 'is_group', 'is_deleted', 'can_upload_files'];

    public function Members()
    {
        return $this->belongsToMany('App\User', 'chats_members', 'chat_id', 'user_id')->withPivot("sound", "is_admin");
    }

    public function LastPost()
    {
        return $this->hasOne('App\ChatPost', 'id', 'last_post');
    }

    public function Posts()
    {
        return $this->hasMany('App\ChatPost');
    }

    public function toArray()
    {
        $array = parent::toArray();


        //$array['name'] = $this->ChatName;

        // $array['LastPost'] = $this->last_post!=null ? $this->LastPost : null;
        //$array['AvatarSrc'] = $this->AvatarSrc;

        return $array;
    }

    public function setAvatarAttribute($value)
    {
        if (is_array($value) && isset($value[0]) && isset($value[0]['base64'])) {
            $name = time() . rand(1, 10000) . '.' . pathinfo($value[0]['filename'], PATHINFO_EXTENSION);
            file_put_contents(public_path('uploads/avatar/' . $name), base64_decode($value[0]['base64']));

            $img = \Image::make(public_path('uploads/avatar/' . $name));
            $img->resize(150, 150);
            $img->save(public_path('uploads/avatar/' . $name), 60);


            $result = $name;
        } elseif (is_array($value) && isset($value['base64'])) {
            $name = time() . rand(1, 10000) . '.' . pathinfo($value['filename'], PATHINFO_EXTENSION);
            file_put_contents(public_path('uploads/avatar/' . $name), base64_decode($value['base64']));
            $img = \Image::make(public_path('uploads/avatar/' . $name));
            $img->resize(150, 150);
            $img->save(public_path('uploads/avatar/' . $name), 60);


            $result = $name;
        } elseif (is_array($value) && isset($value[0]) && is_string($value[0])) {
            $result = basename($value[0]);
        } else {
            $result = null;
        }
        $this->attributes['avatar'] = $result;
    }

    public function getAvatarAttribute()
    {
        if (isset($this->attributes['avatar']) && $this->attributes['avatar'] != '') {
            return '/uploads/avatar/' . $this->attributes['avatar'];
            // }elseif ($this->last_post>0){
            //       return $this->LastPost->User->AvatarSrc;
        } else {
            return null;
        }
    }

    public function getAvatarSrcAttribute()
    {
        return $this->attributes['avatar'] == '' ? '/image/default.jpg' : '/uploads/avatar/' . $this->attributes['avatar'];
    }

    public function getAvatar($user_id)
    {
        $avatar = $this->Avatar;
        if (!is_null($avatar)) {
            return $avatar;
        }
        if ($this->is_group == 1) {
            return '/image/default.jpg';
        }
        $members = $this->Members()->get();
        foreach ($members as $member) {
            if ($member->id != $user_id) {
                return $member->AvatarSrc;
            }
        }
    }

    public function canAccess($user_id)
    {
        $members = $this->Members()->get();
        foreach ($members as $member) {
            if ($member->id == $user_id) {
                return true;
            }
        }
        return false;
    }

    public function getPosts($start, $limit, $user_id)
    {
        $rec = \DB::table('chats_members')
            ->where('chat_id', $this->id)
            ->where('user_id', $user_id)->first();

        return ChatPost::getPosts($this->id, $start, $limit, $rec->clear_date);
    }

    public function getPostsAroundId($post_id, $limit, $user_id)
    {
        $rec = \DB::table('chats_members')
            ->where('chat_id', $this->id)
            ->where('user_id', $user_id)->first();

        return ChatPost::getPostsAroundId($this->id, $post_id, $limit, $rec->clear_date);
    }

    public function getPostsDown($post_id, $limit, $user_id)
    {
        $rec = \DB::table('chats_members')
            ->where('chat_id', $this->id)
            ->where('user_id', $user_id)->first();

        return ChatPost::getPostsDown($this->id, $post_id, $limit, $rec->clear_date);
    }

    public function updateLastPost($post_id = null)
    {
        if (is_null($post_id)) {
            $post = ChatPost::getLastPost($this->id);
            if (!is_null($post)) {
                $post_id = $post->id;
            } else {
                $post_id = null;
            }
        }
        $this->update(['last_post' => $post_id]);
    }

    public function addPost($data, $user)
    {
        $is_system = isset($data['is_system']) ? $data['is_system'] : 0;
        $data['reply_to'] = isset($data['reply_to']) ? $data['reply_to'] : null;
        if ($data['type'] == 'text') {
            $post = ChatPost::addTextPost($this->id, $data['message'], $data['reply_to'], $user, $is_system);
        } elseif ($data['type'] == 'image') {
            $post = ChatPost::addImagePost($this->id, $data['image'], $data['message'], $data['reply_to'], $user);
        } elseif ($data['type'] == 'document') {
            $post = ChatPost::addDocumentPost($this->id, $data['document'], $data['message'], $data['reply_to'], $user);
        }
        if ( is_null($post)){
            return null;
        }
        if ( $is_system == 0) {
            $this->updateLastPost($post->id);
        }
        return $post;
    }

    public function read4user($user_id){
        ChatPost::readPosts4User($this->id, $user_id);
    }


    public function updateSound($user, $flag)
    {
        \DB::table('chats_members')->where('user_id', $user)->where('chat_id', $this->id)->update(['sound' => $flag]);
        //$members = $this->Members();
        //dd($members);
    }

    public function clearAllPosts($user_id)
    {

        \DB::table('chats_members')
            ->where('chat_id', $this->id)
            ->where('user_id', $user_id)->update(['clear_date' => date("Y-m-d H:i:s")]);
    }

    public function remove()
    {
        $this->Posts()->update(['is_deleted' => '1']);
        $this->update(['is_deleted' => 1]);
    }

    public function readPosts4User($user_id)
    {
        ChatPost::readPosts4User($this->id, $user_id);
    }

    public function addMember($user_id)
    {
        $ids = [];
        $members = $this->Members()->get();

        foreach ($members as $member) {
            array_push($ids, ['user_id' => $member->id, 'is_admin' => $member->pivot->is_admin, 'sound' => $member->pivot->sound]);
        }
        array_push($ids, ['user_id' => $user_id, 'is_admin' => 0, 'sound' => 1]);

        $this->Members()->sync([]);
        $this->Members()->sync($ids);
        //$user = User::find($user_id);
       // $post = $this->addPost(['message' => 'Пользователь ' . $user->name . ' добавлен в чат', 'type' => 'text', 'is_system' => 1], null);

        return null;
    }

    public function removeMember($user_id)
    {
        $ids = [];
        $members = $this->Members()->get();


        foreach ($members as $member) {

            if ($member->id != $user_id) {
                array_push($ids, ['user_id' => $member->id, 'is_admin' => $member->pivot->is_admin, 'sound' => $member->pivot->sound]);
            }
        }
        $this->Members()->sync([]);
        $this->Members()->sync($ids);
       // $user = User::find($user_id);
       // $post = $this->addPost(['message' => 'Пользователь ' . $user->name . ' удален из чата', 'type' => 'text', 'is_system' => 1], null);
        return null;
    }

    static function createNewChat($user_id, $users_ids)
    {
        array_push($users_ids, $user_id);

        //$user_chats = self::where('author', $user_id)->where('')->get();
        $chats = Chat::where('author', $user_id)->where('is_group', 0)->where('is_deleted', 0)->get();
        foreach ($chats as $chat) {
            $ids = $chat->Members()->pluck('user_id')->toArray();
            if ($ids == $users_ids) {
                return $chat;
            }
        }
        $data = ['author' => $user_id];
        $chat = self::create($data);
        $chat->Members()->sync($users_ids);


        return $chat;
    }

    static function createNewGroup($user_id, $data)
    {
        //$user_chats = self::where('author', $user_id)->where('')->get();

        $chat_array = ['author' => $user_id, 'is_group' => 1, 'name' => $data['name']];
        if (isset($data['avatar'])) {
            $chat_array['avatar'] = $data['avatar'];
        }
        $chat = self::create($chat_array);
        array_push($data['contacts'], $user_id);
        $chat->Members()->sync($data['contacts']);
        \DB::table('chats_members')->where('chat_id', $chat->id)->where('user_id', $user_id)->update(['is_admin' => '1']);
        // $chat

        return $chat;
    }

    static function getLastPost($chat_id, $user_id)
    {


        $rec = \DB::table('chats_members')
            ->where('chat_id', $chat_id)
            ->where('user_id', $user_id)->first();
        // if( is_null($rec->clear_date)){
        return ChatPost::getLastPost($chat_id, $rec->clear_date);

        //}
    }

    static function getChatWithUsers($user_1, $user_2){

        $chats = Chat::whereIn('author',[$user_1, $user_2])->with('members')->get();

        foreach($chats as $chat){
            $members = $chat->Members()->pluck('user_id')->toArray();
            if ( array_diff([$user_1, $user_2], $members)==[] ){
                return $chat;
            }
        }
        return null;
    }

}

