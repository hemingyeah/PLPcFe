#!/usr/bin/env bash

projects=("shb-pc-fe" "sm4_dd" "sm4-pc" "shb_ssp")
root="/Users/zhengqiangmao/Aaronmao/workspace/"
releaseBranchName="release/$(date +'%m%d')"
echo $1
echo $2
# $1：前端项目所在路径，不传默认/Users/zhengqiangmao/Aaronmao/workspace/
# $2：更新只更新各项目release分支或者bugFix分支或者pre_master

if [[ -z $1 ]] || [[ $1 == "m" ]]; then
    root="/Users/zhengqiangmao/Aaronmao/workspace/"
fi

if [ "$1" == "h" ]; then
    root="其他用户路径"
fi

echo $root

exit;
for p in "${projects[@]}"
do
    cd "$root""$p"
    # check working area
    if [ -n "$(git status --porcelain)" ]; then
      echo "warn: working area not clean";
      exit;
    fi

    if [[ -z $2 ]] || [[ $2 == "release" ]]; then
        # 创建release并推送
        git checkout dev
        git pull
        git checkout -b $releaseBranchName
        git push --set-upstream origin $releaseBranchName
    fi

    if [[ -z $2 ]] || [[ $2 == "bugFix" ]]; then
        # 创建bugFix并推送
        git checkout dev
        git pull
        buFixBranchName="bugFix/$(git describe --tags --abbrev=0)"
        git checkout -b $buFixBranchName
        git push --set-upstream origin $buFixBranchName
    fi

    if [ "$2" == "pre_master" ]; then
        # 创建pre_master并推送
        git checkout dev
        git pull
        preMasterBranchName="pre_master_$(date +'%m%d')"
        git checkout -b $preMasterBranchName
        git push --set-upstream origin $preMasterBranchName
    fi

    # echo "Successfully create branch $releaseBranchName for fe project"
done

#echo "数组元素个数为: ${#projects[*]}"
#echo $PWD
