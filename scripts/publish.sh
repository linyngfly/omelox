echo ">>>>>> copy readme to omelox/readme"
source `dirname $0`/build.sh
git add .
lerna publish $*
