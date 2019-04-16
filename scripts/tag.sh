#!/usr/bin/env bash

# print variable
 echo $1
 echo $2
 echo "$branchName"

# check variable
if [ -z $1 ]; then
  echo "warn: no version";
  exit;
fi

if [ -z $2 ]; then
  echo "warn: no message";
  exit;
fi

# check working area
if [ -n "$(git status --porcelain)" ]; then
  echo "warn: working area not clean";
  exit;
fi

# update dev
branchName=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
if [ "$branchName" == "dev" ]; then
  git pull --rebase
else
  git checkout dev && git pull --rebase
fi

# update master
git checkout master
git pull --rebase
git merge dev
git push

# add tag
git tag -a $1 -m $2
git push origin $1

#
git checkout dev
git push

echo "end"

# catch error


