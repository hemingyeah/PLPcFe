#!/usr/bin/env bash

projects=("shb-pc-fe" "sm4_dd" "sm4-pc" "shb_ssp")
root="/Users/zhengqiangmao/Aaronmao/workspace/"
releaseBranchName="release/$(date +'%m%d')"
echo $1
# $1：只更新各项目release分支或者bugFix分支

for p in "${projects[@]}"
do
    cd "$root""$p"
    # check working area
    if [ -n "$(git status --porcelain)" ]; then
      echo "warn: working area not clean";
      exit;
    fi

    if [[ -z $1 ]] || [[ $1 == "release" ]]; then
        # 创建release并推送
        git checkout dev
        git pull
        git checkout -b $releaseBranchName
        git push --set-upstream origin $releaseBranchName
    fi

    if [[ -z $1 ]] || [[ $1 == "bugFix" ]]; then
        # 创建bugFix并推送
        git checkout dev
        git pull
        buFixBranchName="bugFix/$(git describe --tags --abbrev=0)"
        git checkout -b $buFixBranchName
        git push --set-upstream origin $buFixBranchName
    fi
    
    # echo "Successfully create branch $releaseBranchName for fe project"
done

#echo "数组元素个数为: ${#projects[*]}"
#echo $PWD
