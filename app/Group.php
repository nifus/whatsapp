<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class Group extends Model
{


    protected
        $fillable = ['name', 'access'],
        $table = 'groups';

    public
        $timestamps = false;


    public function setAccessAttribute($value){
        $this->attributes['access'] = json_encode($value);
    }
    public function getAccessAttribute(){
        return json_decode($this->attributes['access']);
    }


    static function getAll(){
        return self::orderBy('name')->get();
    }

    static function getSupplierId(){
        return 3;
    }

}
