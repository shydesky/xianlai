#ifndef Thread_H
#define Thread_H

#include <node.h>
#include <string>
    #include <v8.h>
    #include <nan.h>
    #include "TObj.h"
    #include <pthread.h>
    #include <iostream>

using namespace v8;

class Thread {

 public:
    static void start(const Nan::FunctionCallbackInfo<Value>& args);
    static void* asyn_thread_work(void * arg);
    static void WorkAsyncComplete(uv_work_t *req,int status);
    static void WorkAsync(uv_work_t *req);

 private:



};

#endif