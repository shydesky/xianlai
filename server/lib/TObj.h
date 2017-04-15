#ifndef JOB_H
#define JOB_H
#include <node.h>
#include <string>
#include <v8.h>


using namespace v8;

class TObj {

  public:

//    Persistent<Object> js_obj;
//
//	uv_async_t main_async;
//
//	uv_work_t work_pool;
//
//	uv_loop_t* loop;

   // pthread_t worker_thread;

    Local<Value> value;
    Isolate* isolate;

    TObj();

    ~TObj();

};

#endif