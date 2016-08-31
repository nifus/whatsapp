<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class Chat extends Model
{


    protected $table = 'chats';


    protected $fillable = ['name', 'created_at', 'updated_at', 'avatar', 'author', 'last_post', 'is_group', 'is_deleted', 'can_upload_files'];

    public function Members()
    {
        return $this->belongsToMany('App\User',  'chats_members','chat_id','user_id') ->withPivot("sound", "is_admin");
    }

    public function LastPost()
    {
        return $this->hasOne('App\ChatPost',  'id','last_post');
    }

    public function Posts()
    {
        return $this->hasMany('App\ChatPost');
    }

    public function toArray()
    {
        $array = parent::toArray();
        $members = $this->Members;
        $list_names=[];


        foreach($members as $member){
            if ( $this->author!=$member->id){
                array_push($list_names, $member->name);
            }
        }
        $array['name'] = !empty($array['name']) ? $array['name'] : (sizeof($list_names)>=1 ? implode(', ', $list_names) :  '');

        $array['LastPost'] = $this->last_post!=null ? $this->LastPost : null;
        $array['AvatarSrc'] = $this->AvatarSrc;

        return $array;
    }

    public function getAvatarSrcAttribute(){
        if ($this->avatar){
            return '/uploads/avatar/'.$this->attributes['avatar'];
        }elseif ($this->last_post!=null){
                return $this->LastPost->User->AvatarSrc;
        }else{
            return null;
        }

    }

    public function canAccess($user_id){
        $members = $this->Members()->get();

        foreach($members as $member){

            if ( $member->id==$user_id){
                return true;
            }
        }
            return false;
    }

    public function getPosts($start, $limit){
        return ChatPost::getPosts($this->id, $start, $limit);

    }

    public function addPost($message, $type, $user){
        $post =  ChatPost::addPost($this->id, $message, $type, $user);
        $this->update(['last_post'=>$post->id]);
        return $post;
    }

    public function updateSound($user, $flag){
        \DB::table('chats_members')->where('user_id', $user)->where('chat_id', $this->id)->update(['sound'=>$flag]);
        //$members = $this->Members();
        //dd($members);
    }

    public function clearAllPosts(){
        $this->Posts()->update(['is_deleted'=>'1']);
        $this->update(['last_post'=>null]);
    }

    public function remove(){
        $this->Posts()->update(['is_deleted'=>'1']);
        $this->update(['is_deleted'=>1]);
    }

    static function createNewChat($user_id, $users_ids){
        //$user_chats = self::where('author', $user_id)->where('')->get();

        $data = ['author'=>$user_id];
        $chat = self::create($data);
        $chat->Members()->sync($users_ids);
        return $chat;
    }

}

