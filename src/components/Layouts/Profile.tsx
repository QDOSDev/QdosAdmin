import { Avatar, Card } from '@nextui-org/react';
import { Clock, Mail, UserCircle } from 'lucide-react';
import { IRootState } from '../../store';
import { useSelector } from 'react-redux';
import { formatDate } from '../date_formate';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
    profileImage?: string;
    avatar?: string;
    name?: string;
    email?: string;
    role?: string;
    updatedAt?: string;
}

function Profile() {
    const { profileData } = useSelector((state: IRootState) => state.customerConfig) as { profileData: ProfileData };
    const navigate = useNavigate()

    // Safeguard against empty object
    if (!profileData || Object.keys(profileData).length === 0) {
        return <div>Loading profile...</div>;
    }

    const imageUrl = profileData.profileImage || profileData.avatar || '';
    const name = profileData.name || 'No Name';
    const email = profileData.email || 'N/A';
    const role = profileData.role || 'N/A';
    // const lastLogin = profileData.updatedAt ? formatDate(profileData.updatedAt) : 'N/A';


        const handleNavigation = ()=>{
        navigate('/profile')
    }

    return (
        <div onClick={handleNavigation} className='cursor-pointer'>
            <Card className="p-3 rounded-[10px]" >
                <span className="font-semibold">Profile Information</span>
                <div className="border-b mt-2 mb-2" />

                <div className="flex flex-col gap-6" >
                    <div className="flex items-center gap-4">
                        <Avatar showFallback name={name} size="lg" src={imageUrl} />
                        <div>
                            <h3 className="text-sm font-semibold">{name}</h3>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Email:</span>
                            <span className="text-muted-foreground">{email}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Role:</span>
                            <span className="text-muted-foreground">{role}</span>
                        </div>

                        {/* <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Last Login:</span>
                            <span className="text-muted-foreground">{lastLogin}</span>
                        </div> */}
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default Profile;
