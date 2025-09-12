import { Icon, addCollection } from '@iconify/react';
import { icons as OctoIconCollection } from '@iconify-json/octicon';
import { useState, useEffect } from 'react';

addCollection(OctoIconCollection, 'local');
export default function GithubCard({
  repo,
  preview = { url: '', aspectRatio: '16/9' },
}: {
  repo: string;
  preview?: { url: string; aspectRatio: string };
}) {
  const { url: previewUrl, aspectRatio = '16/9' } = preview;
  const githubUsername = import.meta.env.PUBLIC_GITHUB_USERNAME;
  const repoAddr = repo.replace('@github', githubUsername);
  const repoLink = `https://github.com/${repoAddr}`;
  const [repoData, setRepoData] = useState<any>({});
  useEffect(() => {
    fetch(`https://api.github.com/repos/${repoAddr}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setRepoData(data);
      });
  }, []);

  return (
    <div className="github-card w-full rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
      <div className="flex w-full">
        <div className="card-title flex items-center gap-2 w-full">
          <img src={repoData.owner?.avatar_url} alt={repoData.owner?.login} className="my-0! w-10 h-10 rounded-full" />
          <div className="h-12 flex flex-col justify-between w-full">
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">{(repoAddr || repoData.full_name).split('/').join(' / ')}</div>
              <a href={repoLink} target="_blank">
                <Icon icon="local:octicon:mark-github-16" width={24} height={24} />
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1 items-center text-xs text-gray-500">
                <Icon icon="local:octicon:star-16" width={16} height={16} />
                {repoData.stargazers_count || 0}
              </div>
              <div className="flex gap-1 items-center text-xs text-gray-500">
                <Icon icon="local:octicon:repo-forked-16" width={16} height={16} />
                {repoData.forks_count || 0}
              </div>
              {repoData.license && (
                <div className="flex gap-1 items-center text-xs text-gray-500">
                  <Icon icon="local:octicon:law-16" width={16} height={16} />
                  {repoData.license?.spdx_id}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {repoData.description && (
        <div className="flex items-center">
          <div className="text-sm text-gray-500">{repoData.description}</div>
        </div>
      )}
      {
        // tailwindcss不能使用props创建形如'aspect-[${aspectRatio}]'的动态类名
        // https://tailwindcss.com/docs/detecting-classes-in-source-files#dynamic-class-names
        previewUrl && (
          <div
            className="preview-iframe w-full border border-gray-200 rounded-lg shadow-md overflow-hidden"
            style={{ aspectRatio: `${aspectRatio}` }}
          >
            <iframe src={previewUrl} className="w-full h-full" />
          </div>
        )
      }
    </div>
  );
}
