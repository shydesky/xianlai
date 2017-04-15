{
  "targets": [
    {
      "target_name": "Thread",
      "sources": [ "Thread.cc"],
      "include_dirs":[
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}