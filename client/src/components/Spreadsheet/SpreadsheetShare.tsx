import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { authTokensFetch } from "../../utils/authTokens";
import { useInfo } from "../InfoContext";
import { ShareInfo } from "./Functions/Types";

import { fetchSpreadsheetShares, updatePermission } from "./Functions/SpreadsheetFetch";
import Selector from "../MUI/Selector";

import copyLinkImg from "../../media/svgs/copy-link.svg";

const shareSpreadsheet = async (spreadsheetId: number, email: string, permission: string): Promise<void> => {
    const headers = {
        'Content-Type': 'application/json',
    };

    await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}/shared-users-ids`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ email, permission }),
    });
};

const SpreadsheetShare: React.FC<{ onClose: () => void, uid: number, spreadsheetId: number }> = ({ onClose, uid, spreadsheetId }) => {
    const { setInfo } = useInfo();
    const queryClient = useQueryClient();

    const [email, setEmail] = useState<string>('');
    const [permission, setPermission] = useState<string>('VIEW');

    const { data: spreadsheetShares, isLoading } = useQuery<ShareInfo[], Error>(
        ['spreadsheetShares', spreadsheetId],
        () => fetchSpreadsheetShares(spreadsheetId),
        {
            keepPreviousData: true,
            onError: (error: any) => {
                if (error.status !== 401) {
                    console.error('Error getting spreadsheet shares:', error);
                }
                const errorMessage = error.message || 'An unknown error occurred while getting the spreadsheet shares.';
                setInfo({ message: errorMessage, isError: true });
            },
        }
    );

    const shareMutation = useMutation(
        () => shareSpreadsheet(spreadsheetId, email, permission),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['spreadsheetShares', spreadsheetId]);
                setEmail('');
                setPermission('VIEW');
            },
            onError: (error: any) => {
                if (error.status !== 401) {
                    console.error('Error sharing spreadsheet:', error);
                }
                const errorMessage = error.message || 'Failed to share the spreadsheet.';
                setInfo({ message: errorMessage, isError: true });
            }
        }
    );

    const updatePermissionMutation = useMutation(
        (newPermission: { email: string, permission: string }) => updatePermission(spreadsheetId, newPermission.email, newPermission.permission),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['spreadsheetShares', spreadsheetId]); // Refresh the list of shares
            },
            onError: (error: any) => {
                const errorMessage = error.message || 'Failed to update the permission.';
                setInfo({ message: errorMessage, isError: true });
            }
        }
    );

    const handleShareSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        shareMutation.mutate();
    };

    const handlePermissionChange = (email: string, newPermission: string) => {
        updatePermissionMutation.mutate({ email, permission: newPermission });
    };

    const handleBackgroundClick = () => {
        onClose();
    };

    const handlePopupClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
    };

    const copyLink = () => {
        const linkToCopy = window.location.href;
        navigator.clipboard.writeText(linkToCopy)
            .then(() => {
                setInfo({ message: 'Link copied to clipboard', isError: false });
            })
            .catch((err) => {
                console.error('Failed to copy the link: ', err);
                setInfo({ message: 'Failed to copy the link', isError: true });
            });
    };

    // Sort shares and identify the current user's permission
    const sortedShares = spreadsheetShares?.sort((a, b) => (a.uid === uid ? -1 : b.uid === uid ? 1 : 0));
    const currentUserShare = sortedShares?.find(share => share.uid === uid);
    const canEdit = currentUserShare?.permission !== 'VIEW';

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            onClick={handleBackgroundClick} >
            <div
                className="bg-white text-gray-600 p-4 rounded-lg"
                onClick={handlePopupClick} >
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-bold mr-auto">Share this Spreadsheet</h2>
                    <button
                        onClick={copyLink}
                        className="bg-primary text-white px-2 py-2 rounded hover:bg-primary-dark transition duration-300 ease-in-out mr-2"
                    >
                        <img src={copyLinkImg} alt="Copy link" />
                    </button>
                    <button onClick={onClose}
                        className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary-dark transition duration-300 ease-in-out">
                        X
                    </button>
                </div>

                <div className="px-4 w-full h-[1px] bg-gray-500"></div>
                <h3 className="text-lg my-2">
                    People with access
                </h3>
                <ul className="max-h-[300px] overflow-y-auto custom-scrollbar overflow-x-hidden">
                    {isLoading ? <div>Loading...</div> :
                        sortedShares?.map(share => (
                            <li key={share.uid} className="flex items-center gap-4 mb-2">
                                <img src={share.photoURL} alt={`${share.username}'s avatar`} className="w-10 h-10 rounded-full" />
                                <div className=" max-w-[40%] ">
                                    <div className="font-bold truncate">{share.username} {share.uid === uid && "(You)"}</div>
                                    <div className="text-sm text-gray-600 truncate">{share.email}</div>
                                </div>
                                <div className="ml-auto text-sm font-bold">
                                    <Selector
                                        theme="light"
                                        defaultt={share.permission === 'OWNER' ? 'OWNER' : share.permission}
                                        label="Permission"
                                        name={`permission-${share.uid}`}
                                        options={[
                                            { value: 'VIEW', label: 'View' },
                                            { value: 'EDIT', label: 'Edit' },
                                            { value: 'NONE', label: 'None' },
                                            ...(share.permission === 'OWNER' ? [{ value: 'OWNER', label: 'Owner' }] : []),
                                        ]}
                                        onChange={(value) => handlePermissionChange(share.email, value as string)}
                                        disabled={!(canEdit && share.permission !== 'OWNER')}
                                    />
                                </div>
                            </li>
                        ))}
                </ul>

                {canEdit && (
                    <>
                        <div className="px-4 w-full h-[1px] bg-gray-500"></div>
                        <h3 className="text-lg my-2">
                            Add people...
                        </h3>
                        <form onSubmit={handleShareSubmit} className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email"
                                    className="border border-gray-300 rounded bg-gray-900 text-white h-[40px] px-2"
                                    required
                                />
                                <Selector
                                    theme="light"
                                    defaultt="VIEW"
                                    label="Permission"
                                    name="permission"
                                    options={[
                                        { value: 'VIEW', label: 'View' },
                                        { value: 'EDIT', label: 'Edit' }
                                    ]}
                                    onChange={(value) => setPermission(value as string)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-primary text-white px-4 py-2 rounded mt-2 hover:bg-primary-dark transition duration-300 ease-in-out"
                            >
                                Share
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default SpreadsheetShare;