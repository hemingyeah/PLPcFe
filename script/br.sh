#!/usr/bin/env bash

projects=("shb-pc-fe" "sm4_dd" "sm4-pc" "shb_ssp")
root="/Users/zhengqiangmao/Aaronmao/workspace/"
releaseBranchName="release/$(date +'%m%d')"
echo $1
echo $2                 
echo $3                 
# $1：前端项目所在路径，不传默认/Users/zhengqiangmao/Aaronmao/workspace/
# $2：更新只更新各项目release分支或者bugFix分支或者pre_master

if [[ -z $1 ]] || [[ $1 == "m" ]]; then
    root="/Users/zhengqiangmao/Aaronmao/workspace/"
fi

if [ "$1" == "h" ]; then
    root="/Users/huangbaocheng/SHB/fontend/"
fi

echo $root

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
        releaseBranchName="release/$(date +'%m%d')"
        git checkout -b $releaseBranchName
        git push --set-upstream origin $releaseBranchName

        # 移动端特殊处理 兼容 旧移动端
        if [ "$p" == "sm4_dd" ]; then
        # 创建release并推送
        git checkout stable
        git pull
        releaseBranchName="release/stable_$(date +'%m%d')"
        git checkout -b $releaseBranchName
        git push --set-upstream origin $releaseBranchName

        fi

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
        if [ -z $3 ]; then
            echo "pre_master branch need version name";
            exit;
        fi
        # 创建pre_master并推送
        git checkout dev
        git pull
        preMasterBranchName="pre_master_"$3
        git checkout -b $preMasterBranchName
        git push --set-upstream origin $preMasterBranchName
        
        # 移动端特殊处理 兼容 旧移动端
        if [ "$p" == "sm4_dd" ]; then
        # 创建pre_master并推送
        git checkout stable
        git pull
        preMasterBranchName="pre_master_table_"$3
        git checkout -b $preMasterBranchName
        git push --set-upstream origin $preMasterBranchName

        fi

    fi

    echo "Successfully create branch $releaseBranchName for fe project"
done

#echo "数组元素个数为: ${#projects[*]}"
#echo $PWD
