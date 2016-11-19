<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class ChatPost extends Model
{


    protected
        $fillable = ['chat_id', 'user_id', 'message', 'is_system', 'is_sent', 'is_read', 'type', 'created_at', 'updated_at', 'is_deleted', 'image', 'reply_to', 'document', 'document_name'],
        $table = 'chats_posts';

    public function Chat()
    {
        return $this->hasOne('App\Chat', 'id', 'chat_id');
    }

    public function User()
    {
        return $this->hasOne('App\User', 'id', 'user_id');
    }

    public function ReplyTo()
    {
        return $this->hasOne('App\ChatPost', 'id', 'reply_to');
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['Time'] = $this->Time;
        $array['User'] = $this->User;
        $array['ReplyTo'] = $this->ReplyTo;
        return $array;
    }


    public function setDocumentAttribute($value)
    {
        if (is_array($value)) {
            $name = time() . rand(1, 10000) . '.' . pathinfo($value['filename'], PATHINFO_EXTENSION);
            file_put_contents(public_path('uploads/posts/' . $name), base64_decode($value['base64']));
            $result = $name;
            $this->attributes['document_name'] = $value['filename'];

        } elseif (is_array($value) && isset($value[0]) && is_string($value[0])) {
            $result = basename($value[0]);
        } else {
            $result = null;
        }
        $this->attributes['document'] = $result;

    }

    public function setImageAttribute($value)
    {
        if (is_array($value) && isset($value[0]) && isset($value[0]['base64'])) {
            $name = time() . rand(1, 10000) . '.' . pathinfo($value[0]['filename'], PATHINFO_EXTENSION);
            file_put_contents(public_path('uploads/posts/' . $name), base64_decode($value[0]['base64']));

            $img = \Image::make(public_path('uploads/posts/' . $name));
            $img->save(public_path('uploads/posts/' . $name), 60);

            $img->resize(null, 400, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });

            $img->resize(400, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            $img->save(public_path('uploads/posts/resize_' . $name), 60);


            $result = $name;
        } elseif (is_array($value) && isset($value['base64'])) {
            $name = time() . rand(1, 10000) . '.' . pathinfo($value['filename'], PATHINFO_EXTENSION);
            file_put_contents(public_path('uploads/posts/' . $name), base64_decode($value['base64']));
            $img = \Image::make(public_path('uploads/posts/' . $name));
            $img->save(public_path('uploads/posts/' . $name), 60);

            $img->resize(null, 400, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });

            $img->resize(400, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            $img->save(public_path('uploads/posts/resize_' . $name), 60);


            $result = $name;
        } elseif (is_array($value) && isset($value[0]) && is_string($value[0])) {
            $result = basename($value[0]);
        } else {
            $result = null;
        }
        $this->attributes['image'] = $result;
    }

    public function getImageAttribute()
    {
        if (isset($this->attributes['image']) && $this->attributes['image'] != '') {
            return ['resize' => '/uploads/posts/resize_' . $this->attributes['image'], 'original' => '/uploads/posts/' . $this->attributes['image']];
        } else {
            return null;
        }
    }

    public function getDocumentAttribute()
    {
        if (isset($this->attributes['document']) && $this->attributes['document'] != '') {
            return $this->attributes['document'];
        } else {
            return null;
        }
    }

    public function getTimeAttribute()
    {
        $now = new \DateTime();
        $date = new \DateTime($this->created_at);
        if ($now->format('d.m.y') == $date->format('d.m.y')) {
            return $date->format('H:i');
        } else {
            return $date->format('d.m.y');
        }

    }

    public function remove()
    {
        $this->update(['is_deleted' => '1']);
        $this->Chat->updateLastPosts();
    }

    static function getLastPost($chat_id, $date = null)
    {
        $sql = self::where('chat_id', $chat_id)
            ->where('is_deleted', '0')
            ->where('is_system', 0)
            ->orderBy('id', 'DESC')->limit(1);
        if (!is_null($date)) {
            $sql = $sql->where('created_at', '>', $date);
        }
        return $sql->first();
    }

    static function getPosts($chat_id, $start, $limit, $date = null)
    {
        $sql = self::where('chat_id', $chat_id)->where('is_deleted', '0')->orderBy('id', 'DESC')->skip($start)->take($limit);
        if (!is_null($date)) {
            $sql = $sql->where('created_at', '>', $date);
        }
        return $sql->get();
    }

    static function getPostsAroundId($chat_id, $post_id, $limit, $date = null)
    {
        $sql = self::where('chat_id', $chat_id)
            ->where('is_deleted', '0')
            ->where('id', '<=', $post_id)
            ->orderBy('id', 'DESC')
            ->skip(0)
            ->take(15);
        if (!is_null($date)) {
            $sql = $sql->where('created_at', '>', $date);
        }
        $after = $sql->get();

        $sql = self::where('chat_id', $chat_id)
            ->where('is_deleted', '0')
            ->where('id', '>', $post_id)
            ->orderBy('id', 'ASC')
            ->skip(0)
            ->take(15);
        if (!is_null($date)) {
            $sql = $sql->where('created_at', '>', $date);
        }
        $before = $sql->get();
        return array_merge($before->reverse()->toArray(), $after->toArray());
    }

    static function getPostsDown($chat_id, $post_id, $limit, $date = null)
    {
        $sql = self::where('chat_id', $chat_id)
            ->where('is_deleted', '0')
            ->where('id', '>', $post_id)
            ->orderBy('id', 'ASC')
            ->skip(0)
            ->take($limit);
        if (!is_null($date)) {
            $sql = $sql->where('created_at', '>', $date);
        }
        return $sql->get()->reverse()->toArray();
    }

    static function getPostsUp($chat_id, $post_id, $limit, $date = null)
    {
        $sql = self::where('chat_id', $chat_id)
            ->where('is_deleted', '0')
            ->where('id', '<', $post_id)
            ->orderBy('id', 'DESC')
            ->skip(0)
            ->take($limit);
        if (!is_null($date)) {
            $sql = $sql->where('created_at', '>', $date);
        }
        return $sql->get()->toArray();
    }

    static function addTextPost($chat, $message, $reply_to, $user, $is_system = 0)
    {
        $message = trim($message);
        if ($message == '') {
            return null;
        }
        return self::create([
            'chat_id' => $chat,
            'user_id' => $user,
            'message' => $message,
            'type' => 'text',
            'is_sent' => '1',
            'is_system' => $is_system,
            'is_deleted' => '0',
            'is_read' => '0',
            'reply_to' => $reply_to
        ]);
    }

    static function addImagePost($chat, $image, $message, $reply_to, $user, $is_system = 0)
    {
        $message = trim($message);
        return self::create([
            'image' => $image,
            'chat_id' => $chat,
            'user_id' => $user,
            'message' => $message,
            'type' => 'image',
            'is_sent' => '1',
            'is_system' => $is_system,
            'is_deleted' => '0',
            'is_read' => '0',
            'reply_to' => $reply_to
        ]);
    }

    static function addDocumentPost($chat, $document, $message, $reply_to, $user, $is_system = 0)
    {
        $message = trim($message);
        return self::create([
            'document' => $document,
            'chat_id' => $chat,
            'user_id' => $user,
            'message' => $message,
            'type' => 'document',
            'is_sent' => '1',
            'is_system' => $is_system,
            'is_deleted' => '0',
            'is_read' => '0',
            'reply_to' => $reply_to
        ]);
    }

    static function getCountUnreadPosts($chat_id, $user_id, $date = null)
    {

        $sql = self::where('chat_id', $chat_id)
            ->where('user_id', '!=', $user_id)
            ->where('is_read', 0)
            ->where('is_deleted', '0');

        if (!is_null($date)) {
            $sql = $sql->where('created_at', '>', $date);

        }
        return $sql->count();;
    }

    static function readPosts4User($chat_id, $user_id)
    {
        \DB::table('chats_members')->where('user_id', $user_id)->where('chat_id', $chat_id)->update(['unread' => 0]);
        return self::where('chat_id', $chat_id)->where('user_id', '!=', $user_id)->where('is_read', '0')->where('is_deleted', '0')->update(['is_read' => '1']);

    }


}
