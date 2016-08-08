<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Article;
use App\User;


use App\Events\SignInErrorEvent;
use App\Events\SignInSuccessEvent;

class ArticleController extends Controller
{


    public function getAll()
    {
        $rows = Article::getAll();
        return response()->json($rows->toArray());
    }

    public function getById($id)
    {
        $row = Article::find($id);
        return response()->json($row->toArray(), 200, [], JSON_NUMERIC_CHECK);
    }


    public function store(Request $request)
    {
        $data = $request->all();
        try {
            $article = Article::createNewArticle($data);
            return response()->json(['success' => true, 'article'=>$article->toArray()]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function update($id, Request $request)
    {
        try {
            Article::findOrDie($id)->updateArticle($request->all());
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }


    public function delete($id)
    {
        try{
            Article::findOrDie($id)->delete();
            return response()->json(['success' => true]);
        }catch( \Exception $e ){
            return response()->json(['success' => false,'error'=>$e->getMessage()]);
        }
    }

    public function restore($id)
    {
        try{
            Article::findOrDie($id)->restore();
            return response()->json(['success' => true]);
        }catch( \Exception $e ){
            return response()->json(['success' => false,'error'=>$e->getMessage()]);
        }
    }


}
