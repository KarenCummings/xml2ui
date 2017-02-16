if $(test "$#" != "1"); then
  echo "Argument cannot be empty - must contain new directory name.";
else
  if $(! test -f index.0.html); then mv index.html index.0.html; fi
  cat index.0.html | awk -v newdir="$1" '{s=$0; gsub("simple_ui", newdir, s); print s;}' > index.html
fi
