import { Button, Image } from 'antd';
import { Header } from "../../asset";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState, ChangeEvent } from 'react';
import { web3, CarContract, CreditContract } from "../../utils/contract";
import './index.css';
import { Carousel, Collapse } from 'antd';
import React from 'react';
import { Card, Space, Row, Col } from 'antd';
import { Tabs, Modal, Form, Input, InputNumber, Select } from 'antd';
import BigNumber from 'bignumber.js'
const { TabPane } = Tabs;
const { Option } = Select


import car1 from '../../asset/car1.jpg';
import car2 from '../../asset/car2.jpg';
import car3 from '../../asset/car3.jpg';
import car4 from '../../asset/car4.jpg';
import car5 from '../../asset/car5.jpg';


const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'hw'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:7545'

const contentStyle: React.CSSProperties = {
    margin: 0,
    height: '60px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
};

const LotteryPage = () => {

    const [account, setAccount] = useState('')
    const [accounts, setAccounts] = useState<string[]>([])
    const [balance, setBalance] = useState(0)
    const [carList, setCarList] = useState<BigNumber[]>([]);
    const [ubCarList, setUbCarList] = useState<BigNumber[]>([])
    const [borrowCarToken, setBorrowCarToken] = useState(new BigNumber(0))
    const [borrowTime, setBorrowTime] = useState(new BigNumber(0))
    const [borrower, setBorrower] = useState('')
    const [owner, setOwner] = useState('')
    const images = [car1, car2, car3, car4, car5]
    const [visibility, setVisibility] = useState(false)
    const [queryCarToken, setQueryCarToken] = useState(new BigNumber(0))
    const [queryResultShow, setQueryResultShow] = useState(false)

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const { ethereum } = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts_ = await web3.eth.getAccounts()
                if (accounts_ && accounts_.length) {
                    setAccount(accounts_[0])
                }
                setAccounts(accounts_)
                //console.log(accounts)
            }
        }

        initCheckAccounts()
    }, [])


    const updateBalance = async () => {
        if (CarContract) {
            const ab = await CarContract.methods.getBalance().call({
                from: account
            })
            setBalance(ab)
        }
    }
    useEffect(() => {
        const getAccountInfo = async () => {
            if (CarContract) {
                const ab = await CarContract.methods.getBalance().call({
                    from: account
                })
                setBalance(ab)
                console.log(ab);
            } else {
                alert('Contract not exists.')
            }
        }

        if (account !== '') {
            getAccountInfo()
        }
    }, [account])

    useEffect(() => {
        getCarList();
        getUnborrowedCars();
    }, [account])

    const onClaimTokenAirdrop = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (CarContract) {
            try {
                await CarContract.methods.mintCredits().send({
                    from: account
                })
                await updateBalance();
                alert('You have claimed Credits.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const getInitCar = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (CarContract) {
            try {
                await CarContract.methods.mintCar(account).send({
                    from: account
                })
                await getCarList();
                await getUnborrowedCars();
                alert('领取成功')
            } catch (error: any) {
                alert(error.message)
            }
        }
    }

    const getCarList = async () => {
        if (account === '') {
            return
        }
        if (CarContract) {
            try {
                setCarList(await CarContract.methods.getAllCars().call({
                    from: account
                }))
            } catch (error: any) {
                alert(error.message)
            }
        }
    }

    const getUnborrowedCars = async () => {
        if (account === '') {
            return
        }
        if (CarContract) {
            try {
                var tmp: any[] = []
                for (var acc in accounts) {
                    //console.log(accounts[acc])
                    tmp = [...tmp, ...(await CarContract.methods.getAllUnborrowedCars().call({
                        from: accounts[acc]
                    }))]
                }
                setUbCarList(tmp)
            } catch (error: any) {
                alert(error.message)
            }
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const { ethereum } = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.chainId }] })
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({
                            method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            //await ethereum.request({method: 'eth_requestAccounts'});
            await ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });

            // 获取小狐狸拿到的授权用户列表
            const accounts_ = await ethereum.request({ method: 'eth_accounts' });
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts_[0] || 'Not able to get accounts');
            for(var i in accounts_) {
                if(accounts_[i] !== '' && !accounts.includes(accounts_[i])) {
                    setAccounts([...accounts, accounts_[i]])
                }
            }
            //setAccounts(accounts_);
            console.log(accounts)
        } catch (error: any) {
            alert(error.message)
        }

        getCarList();
    }

    const disconnectWallet = () => {
        setAccount('');
    }

    const changeVisibility = () => {
        setVisibility(!visibility);
    };

    const handleBorrowCar = (car: BigNumber) => {
        changeVisibility();
        setBorrowCarToken(car)
    }

    const handleSelectChange = (value: number) => {
        setBorrowTime(new BigNumber(value * 3600))
    }

    const handleOk = async () => {
        changeVisibility()
        if (CarContract) {
            try {
                console.log(borrowCarToken.toString())
                await CarContract.methods.borrowCar(borrowCarToken, borrowTime).send({
                    from: account
                })
                await updateBalance();
            } catch (error: any) {
                alert(error.message)
            }
        }
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQueryCarToken(new BigNumber(e.target.value));
    };

    const handleSubmit = async () => {
        setOwner(await CarContract.methods.getOwner(queryCarToken).call({
            from: account
        }))
        setBorrower(await CarContract.methods.getBorrower(queryCarToken).call({
            from: account
        }))
        //console.log(borrower + ", " + owner)
        changeQueryShow()
    }

    const changeQueryShow = () => {
        setQueryResultShow(!queryResultShow)
    }

    return (
        <div style={{ position: 'absolute', top: 0, left: 0 }} className='main'>

            <h1>汽车租赁系统</h1>
            <div style={{ position: 'fixed', minHeight: '600px', textAlign: 'left' }}>

                <Tabs defaultActiveKey="1" tabPosition='left'>
                    <TabPane tab="主页" key="1">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Card title="领取(测试)" bordered hoverable>
                                <Button type="primary" onClick={onClaimTokenAirdrop}>领取测试代币</Button>
                                <Button onClick={getInitCar}>领取测试车</Button>

                            </Card>
                            <Card title="汽车查询" bordered hoverable>
                                <Form  >
                                    <Form.Item label="查询汽车：">
                                        <Input type="number" onChange={handleInputChange} placeholder='请输入你要查询的汽车的token' />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" onClick={handleSubmit}>
                                            提交
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                            <Card title="连接状态" bordered hoverable>

                                <div className='account'>
                                    {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                                    {account !== '' && <Button onClick={disconnectWallet}>断开连接</Button>}
                                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                                    <div>当前账户代币余额：{account === '' ? 0 : balance}</div>
                                </div>
                            </Card>
                        </div>

                        <Modal
                            title='查询结果'
                            open={queryResultShow}
                            onCancel={changeQueryShow}
                            onOk={changeQueryShow}
                        >
                            <h4>拥有者: {owner}</h4>
                            <h4>{borrower === "0x" + "0".repeat(40) ? '未被借出' : '借车人: ' + borrower}</h4>
                        </Modal>

                    </TabPane>
                    <TabPane tab="我的车辆" key="2">
                        <div style={{ height: '800px', overflowY: 'auto' }} className="">
                            <Space direction='vertical' size={16}>
                                {carList.map((car, index) => (
                                    <Card
                                        hoverable
                                        style={{ width: 800 }}
                                    //cover={<img alt={car.name} src={car.image} />}
                                    >
                                        <h4>{'car' + index}</h4>
                                        <img src={images[index % 5]} alt={images[index % 5]} />
                                        <h4>{'ID: ' + car}</h4>
                                    </Card>
                                ))}
                            </Space>
                        </div>
                    </TabPane>
                    <TabPane tab="空闲车辆" key="3">
                        <div style={{ height: '800px', overflowY: 'auto' }} className="">
                            <Space direction='vertical' size={16}>
                                {ubCarList.map((car, index) => (
                                    <Card
                                        hoverable
                                        style={{ width: 800 }}
                                    >
                                        <h4>{'car' + index}</h4>
                                        <img src={images[index % 5]} alt={images[index % 5]} />
                                        <h4>{'ID: ' + car}</h4>
                                        <Button type="primary" onClick={() => handleBorrowCar(car)}>Borrow</Button>
                                        <Modal
                                            title="对话框"
                                            open={visibility}
                                            onCancel={changeVisibility}
                                            onOk={handleOk}>
                                            <Form>
                                                <Form.Item label="请选择租车的时长(小时)">
                                                    <div>
                                                        <Select
                                                            showSearch
                                                            style={{ width: 200 }}
                                                            placeholder="选择一个数字"
                                                            optionFilterProp="children"
                                                            onChange={handleSelectChange}
                                                        >
                                                            {[...Array(100).keys()].map(i => (
                                                                <Option key={i + 1} value={i + 1}>
                                                                    {i + 1}
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </div>
                                                </Form.Item>
                                            </Form>
                                        </Modal>
                                    </Card>
                                ))}
                            </Space>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}

export default LotteryPage