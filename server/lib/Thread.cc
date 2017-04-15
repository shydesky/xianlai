#include "Thread.h"

struct Work {
  uv_work_t  request;
  Persistent<Function> callback;
    Isolate * isolate;
};

class ArrayBufferAllocator : public v8::ArrayBuffer::Allocator {
public:
    virtual void* Allocate(size_t length) {
        void* data = AllocateUninitialized(length);
        return data == NULL ? data : memset(data, 0, length);
    }
    virtual void* AllocateUninitialized(size_t length) { return malloc(length); }
    virtual void Free(void* data, size_t) { free(data); }
};

//void CalculateResultsAsync(const v8::FunctionCallbackInfo<v8::Value>&args) {
//    Isolate* isolate = args.GetIsolate();
//
//    Work * work = new Work();
//    work->request.data = work;
//
////    Local<Array> input = Local<Array>::Cast(args[0]);
////    unsigned int num_locations = input->Length();
////    for (unsigned int i = 0; i < num_locations; i++) {
////      work->locations.push_back(
////          unpack_location(isolate, Local<Object>::Cast(input->Get(i)))
////      );
////    }
//
//    Local<Function> callback = Local<Function>::Cast(args[0]);
//    work->callback.Reset(isolate, callback);
//
//    // kick of the worker thread
//    uv_queue_work(uv_default_loop(),&work->request,
//        WorkAsync,WorkAsyncComplete);
//
//    args.GetReturnValue().Set(Undefined(isolate));
//
//}


     void* Thread::asyn_thread_work(void * arg){

        //TObj* obj=(TObj*)arg;


        while(true)
        {

         Isolate* isolate=(Isolate*)arg;
            v8::Locker locker(isolate);
            isolate->Enter();

//             Local<Function> cb=obj->cb;
            //Isolate* isolate = Isolate::GetCurrent();
//            HandleScope scope(isolate);
//            const unsigned argc = 1;
//            //Local<Value> argv[argc] = {String::NewFromUtf8(isolate, "aasdadasdasd")};
//            Local<Value> argv[argc] = {Nan::New("asdadadasda").ToLocalChecked()};
//            cb->Call(Isolate::GetCurrent()->GetCurrentContext()->Global(), argc, argv);


            std::cerr << "%%%%" << std::endl;

            sleep(1);
        }

//	     Isolate* isolate = Isolate::GetCurrent();
//         HandleScope scope(isolate);
//	     const unsigned argc = 1;
//         Local<Value> argv[argc] = {String::NewFromUtf8(isolate, "aasdadasdasd")};
//         cb->Call(Isolate::GetCurrent()->GetCurrentContext()->Global(), argc, argv);


	    //uv_async_send(&job_ptr->main_async);

    }
 void Thread::WorkAsyncComplete(uv_work_t *req,int status)
{
    Isolate * isolate = Isolate::GetCurrent();
    v8::HandleScope handleScope(isolate); // Required for Node 4.x

    Work *work = static_cast<Work *>(req->data);

//    // the work has been done, and now we pack the results
//    // vector into a Local array on the event-thread's stack.
//    Local<Array> result_list = Array::New(isolate);
//    for (unsigned int i = 0; i < work->results.size(); i++ ) {
//      Local<Object> result = Object::New(isolate);
//      pack_rain_result(isolate, result, work->results[i]);
//      result_list->Set(i, result);
//    }
//    Handle<Value> argv[] = { result_list };
//
//        // execute the callback
        const unsigned argc = 1;
        Local<Value> argv[argc] = {Nan::New("213").ToLocalChecked()};
        Local<Function>::New(isolate, work->callback)->
          Call(isolate->GetCurrentContext()->Global(), argc, argv);

//       // Free up the persistent function callback
        work->callback.Reset();


        delete work;
 }

 void Thread::WorkAsync(uv_work_t *req)
{

//    while(true)
//    {
//
//
//        Work *work = static_cast<Work *>(req->data);
//        //Isolate * isolate = Isolate::GetCurrent();
//        ArrayBufferAllocator allocator;
//        //v8::ArrayBuffer::Allocator * allocator=ArrayBuffer::Allocator::NewDefaultAllocator
//        Isolate::CreateParams create_params;
//        create_params.array_buffer_allocator = &allocator;
//        Isolate* isolate =Isolate::New(create_params);
//       // v8::Isolate* isolate = v8::Isolate::New();
//        //v8::HandleScope handleScope(isolate);
//        const unsigned argc = 1;
//        Local<Value> argv[argc] = {Nan::New("213").ToLocalChecked()};
//        Local<Function>::New(isolate, work->callback)->Call(Isolate::GetCurrent()->GetCurrentContext()->Global(), argc, argv);
//
//
//        std::cerr << "%%%%" << std::endl;
//        sleep(1);
//
//    }

         int a=100;
           for(int i=0;i<a;i++)
           {
              for(int j=0;j<a;j++)
              {
                 //log("*");

              }

           }

}

     void Thread::start(const Nan::FunctionCallbackInfo<Value>& args) {

//              Isolate* isolate = args.GetIsolate();
////
////                        HandleScope scope(isolate);
////                        Local<Function> cb = Local<Function>::Cast(args[0]);
////                        const unsigned argc = 1;
////                        Local<Value> argv[argc] = {String::NewFromUtf8(isolate, "aasdadasdasd")};
////                        cb->Call(Isolate::GetCurrent()->GetCurrentContext()->Global(), argc, argv);
//
////
//             //Local<Function> cb = Local<Function>::Cast(args[0]);
////
//            // TObj *obj = new TObj();
//             //obj->value=args[0];
//
//              // cb = Persistent::New(Local::Cast(args[0]))
//
//             //obj->isolate=isolate;
////             pthread_t id_1;
////             uv_thread_create(&id_1, asyn_thread_work, 0);
////
//
//            //Isolate * isolate = args.GetIsolate();
//       // persist.Reset(isolate, args[0]->ToObject());
//
//  // spawn a new worker thread to modify the target object
//         //std::thread t(asyn_thread_work, obj);
//        // t.detach();
//
//
//
//
//          pthread_t id_1;
//         pthread_create(&id_1 ,NULL, Thread::asyn_thread_work, isolate);
//
//       isolate->Exit();
//    v8::Unlocker unlocker(isolate);
//
//         while (1);
           //args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));


           Isolate* isolate = args.GetIsolate();

               Work * work = new Work();
               work->request.data = work;
                work->isolate=isolate;
           //    Local<Array> input = Local<Array>::Cast(args[0]);
           //    unsigned int num_locations = input->Length();
           //    for (unsigned int i = 0; i < num_locations; i++) {
           //      work->locations.push_back(
           //          unpack_location(isolate, Local<Object>::Cast(input->Get(i)))
           //      );
           //    }

               Local<Function> callback = Local<Function>::Cast(args[0]);
               work->callback.Reset(isolate, callback);

               // kick of the worker thread
               uv_queue_work(uv_default_loop(),&work->request,
                   Thread::WorkAsync,Thread::WorkAsyncComplete);

               args.GetReturnValue().Set(Undefined(isolate));


    }

//  void start(const FunctionCallbackInfo<Value>& args) {
//
//         Isolate* isolate = Isolate::GetCurrent();
//         HandleScope scope(isolate);
//         args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
//
//    }

    void Init(Handle<Object> exports, Handle<Object> module) {

            //NODE_SET_METHOD(exports, "start", start);
            //String::NewSymbol("sync_thread")

        exports->Set(Nan::New("start").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(Thread::start)->GetFunction());
    }



//        void Init(Handle<Object> exports) {
//
//             NODE_SET_METHOD(exports, "start", start);
//        }

    NODE_MODULE(Thread, Init)